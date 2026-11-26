import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  archiveAdminDocumento,
  createAdminDocumento,
  listAdminCategoriasDocumentos,
  listAdminDocumentos,
  patchAdminDocumento,
  uploadAdminArchivo,
  type AdminDocumento,
} from '../../api/admin';
import { ApiError } from '../../api/client';
import { AsyncState } from '../../components/ui/AsyncState';
import { useAdminSession } from '../../context/AdminSessionContext';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { toDbDateTime } from '../../lib/dates';
import styles from './admin.module.css';

interface FormState {
  id: number | null;
  titulo: string;
  descripcion: string;
  categoriaId: number | null;
  publicadoEn: string | null;
}

const EMPTY_FORM: FormState = { id: null, titulo: '', descripcion: '', categoriaId: null, publicadoEn: null };

type Message = { type: 'ok' | 'error'; text: string } | null;

const statusClass = (estado: string): string =>
  estado === 'publicado'
    ? `${styles.status} ${styles.statusPublicado}`
    : estado === 'archivado'
      ? `${styles.status} ${styles.statusArchivado}`
      : `${styles.status} ${styles.statusBorrador}`;

export function AdminDocumentosPage() {
  useDocumentTitle('Documentos · Panel');
  const { session, refreshCsrf } = useAdminSession();
  const [reload, setReload] = useState(0);
  const docsState = useApi((signal) => listAdminDocumentos(signal), [reload]);
  const catsState = useApi((signal) => listAdminCategoriasDocumentos(signal), []);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [saving, setSaving] = useState(false);

  const run = async (action: (token: string) => Promise<unknown>, okText: string): Promise<boolean> => {
    if (!session) return false;
    setSaving(true);
    setMessage(null);
    try {
      await action(session.csrf_token);
      setMessage({ type: 'ok', text: okText });
      setReload((value) => value + 1);
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        await refreshCsrf().catch(() => undefined);
        setMessage({ type: 'error', text: 'El token de seguridad ha caducado. Vuelve a intentarlo.' });
      } else if (error instanceof ApiError && error.status === 422) {
        setMessage({ type: 'error', text: Object.values(error.fields)[0] ?? error.message });
      } else if (error instanceof ApiError && error.status === 0) {
        setMessage({ type: 'error', text: 'No se pudo conectar con el servidor.' });
      } else {
        setMessage({ type: 'error', text: 'No se pudo guardar el documento. Inténtalo de nuevo.' });
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const edit = (documento: AdminDocumento) => {
    setForm({
      id: documento.id,
      titulo: documento.titulo_es,
      descripcion: documento.descripcion_es ?? '',
      categoriaId: documento.categoria_id,
      publicadoEn: documento.publicado_en,
    });
    setFile(null);
    setMessage(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const titulo = form.titulo.trim();
    const categoriaId = form.categoriaId;
    if (titulo === '' || categoriaId === null) {
      setMessage({ type: 'error', text: 'El título y la categoría son obligatorios.' });
      return;
    }
    const editingId = form.id;
    const ok = await run(async (token) => {
      if (editingId !== null) {
        await patchAdminDocumento(
          editingId,
          { titulo_es: titulo, descripcion_es: form.descripcion.trim() || null, categoria_id: categoriaId },
          token,
        );
        return;
      }
      if (!file) throw new ApiError(422, 'validation_error', 'Archivo requerido');
      const upload = await uploadAdminArchivo(file, token);
      await createAdminDocumento(
        {
          titulo_es: titulo,
          descripcion_es: form.descripcion.trim() || null,
          categoria_id: categoriaId,
          archivo_id: upload.id,
          estado: 'publicado',
          publicado_en: toDbDateTime(),
        },
        token,
      );
    }, editingId === null ? 'Documento creado.' : 'Documento actualizado.');
    if (ok) {
      setForm(EMPTY_FORM);
      setFile(null);
    }
  };

  const togglePublicacion = (documento: AdminDocumento) => {
    const publicando = documento.estado !== 'publicado';
    void run(
      (token) =>
        patchAdminDocumento(
          documento.id,
          { estado: publicando ? 'publicado' : 'borrador', publicado_en: publicando ? toDbDateTime() : null },
          token,
        ),
      publicando ? 'Documento publicado.' : 'Documento despublicado.',
    );
  };

  const categorias =
    catsState.status === 'success' && catsState.data && 'data' in catsState.data ? catsState.data.data : [];

  return (
    <>
      <h1 className={styles.heading}>Documentos</h1>

      {message && (
        <p
          className={`${styles.message} ${message.type === 'ok' ? styles.messageOk : styles.messageError}`}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      )}

      <section className={styles.panel} aria-labelledby="documentos-listado">
        <h2 id="documentos-listado">Documentos publicados y borradores</h2>
        <AsyncState state={docsState} loadingLabel="Cargando documentos…" errorMessage="No se pudieron cargar los documentos.">
          {(result) =>
            result.data.length === 0 ? (
              <p className={styles.empty}>Todavía no hay documentos. Sube el primero con el formulario.</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className="visually-hidden">Listado de documentos del panel</caption>
                  <thead>
                    <tr>
                      <th scope="col">Título</th>
                      <th scope="col">Categoría</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((documento) => (
                      <tr key={documento.id}>
                        <td>
                          <strong>{documento.titulo_es}</strong>
                        </td>
                        <td>
                          {categorias.find((c) => c.id === documento.categoria_id)?.nombre_es ?? documento.categoria_id}
                        </td>
                        <td>
                          <span className={statusClass(documento.estado)}>{documento.estado}</span>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <button type="button" className={styles.linkButton} onClick={() => edit(documento)}>
                              Editar
                            </button>
                            <button
                              type="button"
                              className={styles.linkButton}
                              onClick={() => togglePublicacion(documento)}
                              disabled={saving}
                            >
                              {documento.estado === 'publicado' ? 'Despublicar' : 'Publicar'}
                            </button>
                            <button
                              type="button"
                              className={styles.linkButton}
                              onClick={() =>
                                void run((token) => archiveAdminDocumento(documento.id, token), 'Documento archivado.')
                              }
                              disabled={saving}
                            >
                              Archivar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </AsyncState>
      </section>

      <section className={styles.panel} aria-labelledby="documento-form">
        <h2 id="documento-form">{form.id === null ? 'Nuevo documento' : 'Editar documento'}</h2>
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="doc-titulo">
              Título
            </label>
            <input
              id="doc-titulo"
              className={styles.input}
              required
              value={form.titulo}
              onChange={(event) => setForm({ ...form, titulo: event.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="doc-descripcion">
              Descripción
            </label>
            <textarea
              id="doc-descripcion"
              className={styles.textarea}
              value={form.descripcion}
              onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="doc-categoria">
              Categoría
            </label>
            <select
              id="doc-categoria"
              className={styles.select}
              required
              value={form.categoriaId ?? ''}
              onChange={(event) => setForm({ ...form, categoriaId: Number(event.target.value) })}
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre_es}
                </option>
              ))}
            </select>
          </div>
          {form.id === null && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="doc-archivo">
                Archivo PDF
              </label>
              <input
                id="doc-archivo"
                className={styles.input}
                type="file"
                accept="application/pdf,image/*"
                onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)}
              />
              <p className={styles.hint}>Se sube primero y luego se crea el documento asociado.</p>
            </div>
          )}
          <div className={styles.actions}>
            <button className="button" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : form.id === null ? 'Subir y publicar' : 'Guardar cambios'}
            </button>
            {form.id !== null && (
              <button
                className="button button--outline"
                type="button"
                onClick={() => setForm(EMPTY_FORM)}
                disabled={saving}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>
    </>
  );
}
