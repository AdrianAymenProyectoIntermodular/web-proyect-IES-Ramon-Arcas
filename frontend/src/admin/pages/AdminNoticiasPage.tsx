import { useState, type FormEvent } from 'react';
import {
  archiveAdminNoticia,
  createAdminNoticia,
  listAdminNoticias,
  patchAdminNoticia,
  type AdminNoticia,
  type NoticiaInput,
} from '../api/admin';
import { ApiError } from '../../api/client';
import { AsyncState } from '../../components/ui/AsyncState';
import { useAdminSession } from '../context/AdminSessionContext';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatLongDate, toDbDateTime } from '../../lib/dates';
import { slugify } from '../../lib/slug';
import styles from '../admin.module.css';

interface FormState {
  id: number | null;
  slug: string;
  titulo: string;
  resumen: string;
  cuerpo: string;
  categoria: string;
  estado: string;
  publicadoEn: string | null;
}

const EMPTY_FORM: FormState = {
  id: null,
  slug: '',
  titulo: '',
  resumen: '',
  cuerpo: '',
  categoria: 'institucional',
  estado: 'borrador',
  publicadoEn: null,
};

const CATEGORIAS = [
  { value: 'institucional', label: 'Institucional' },
  { value: 'academico', label: 'Académico' },
  { value: 'cultural', label: 'Cultural' },
] as const;

type Message = { type: 'ok' | 'error'; text: string } | null;

const statusClass = (estado: string): string =>
  estado === 'publicado'
    ? `${styles.status} ${styles.statusPublicado}`
    : estado === 'archivado'
      ? `${styles.status} ${styles.statusArchivado}`
      : `${styles.status} ${styles.statusBorrador}`;

export function AdminNoticiasPage() {
  useDocumentTitle('Noticias · Panel');
  const { session, refreshCsrf } = useAdminSession();
  const [reload, setReload] = useState(0);
  const state = useApi((signal) => listAdminNoticias(signal), [reload]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
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
        setMessage({ type: 'error', text: 'No se pudo guardar la noticia. Inténtalo de nuevo.' });
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const edit = (noticia: AdminNoticia) => {
    setForm({
      id: noticia.id,
      slug: noticia.slug,
      titulo: noticia.titulo_es,
      resumen: noticia.resumen_es ?? '',
      cuerpo: noticia.cuerpo_es,
      categoria: noticia.categoria ?? 'institucional',
      estado: noticia.estado,
      publicadoEn: noticia.publicado_en,
    });
    setMessage(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const titulo = form.titulo.trim();
    const cuerpo = form.cuerpo.trim();
    if (titulo === '' || cuerpo === '') {
      setMessage({ type: 'error', text: 'El título y el cuerpo son obligatorios.' });
      return;
    }
    const payload: NoticiaInput = {
      slug: form.id === null ? slugify(titulo) || 'noticia' : form.slug,
      titulo_es: titulo,
      resumen_es: form.resumen.trim() || null,
      cuerpo_es: cuerpo,
      categoria: form.categoria || null,
      estado: form.estado,
      publicado_en: form.estado === 'publicado' ? (form.publicadoEn ?? toDbDateTime()) : null,
    };
    const editingId = form.id;
    const ok = await run(
      (token) =>
        editingId === null ? createAdminNoticia(payload, token) : patchAdminNoticia(editingId, payload, token),
      editingId === null ? 'Noticia creada.' : 'Noticia actualizada.',
    );
    if (ok) setForm(EMPTY_FORM);
  };

  const togglePublicacion = (noticia: AdminNoticia) => {
    const publicando = noticia.estado !== 'publicado';
    void run(
      (token) =>
        patchAdminNoticia(
          noticia.id,
          { estado: publicando ? 'publicado' : 'borrador', publicado_en: publicando ? toDbDateTime() : null },
          token,
        ),
      publicando ? 'Noticia publicada.' : 'Noticia despublicada.',
    );
  };

  return (
    <>
      <h1 className={styles.heading}>Noticias</h1>

      {message && (
        <p
          className={`${styles.message} ${message.type === 'ok' ? styles.messageOk : styles.messageError}`}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      )}

      <section className={styles.panel} aria-labelledby="noticias-listado">
        <h2 id="noticias-listado">Noticias publicadas y borradores</h2>
        <AsyncState state={state} loadingLabel="Cargando noticias…" errorMessage="No se pudieron cargar las noticias.">
          {(result) =>
            result.data.length === 0 ? (
              <p className={styles.empty}>Todavía no hay noticias. Crea la primera con el formulario.</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className="visually-hidden">Listado de noticias del panel</caption>
                  <thead>
                    <tr>
                      <th scope="col">Título</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Publicada</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((noticia) => (
                      <tr key={noticia.id}>
                        <td>
                          <strong>{noticia.titulo_es}</strong>
                          <br />
                          <span className={styles.hint}>/{noticia.slug}</span>
                        </td>
                        <td>
                          <span className={statusClass(noticia.estado)}>{noticia.estado}</span>
                        </td>
                        <td>{noticia.publicado_en ? formatLongDate(noticia.publicado_en) : '—'}</td>
                        <td>
                          <div className={styles.rowActions}>
                            <button type="button" className={styles.linkButton} onClick={() => edit(noticia)}>
                              Editar
                            </button>
                            <button
                              type="button"
                              className={styles.linkButton}
                              onClick={() => togglePublicacion(noticia)}
                              disabled={saving}
                            >
                              {noticia.estado === 'publicado' ? 'Despublicar' : 'Publicar'}
                            </button>
                            <button
                              type="button"
                              className={styles.linkButton}
                              onClick={() => void run((token) => archiveAdminNoticia(noticia.id, token), 'Noticia archivada.')}
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

      <section className={styles.panel} aria-labelledby="noticia-form">
        <h2 id="noticia-form">{form.id === null ? 'Nueva noticia' : 'Editar noticia'}</h2>
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="noticia-titulo">
              Título
            </label>
            <input
              id="noticia-titulo"
              className={styles.input}
              required
              value={form.titulo}
              onChange={(event) => setForm({ ...form, titulo: event.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="noticia-resumen">
              Resumen
            </label>
            <input
              id="noticia-resumen"
              className={styles.input}
              value={form.resumen}
              onChange={(event) => setForm({ ...form, resumen: event.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="noticia-categoria">
              Categoría
            </label>
            <select
              id="noticia-categoria"
              className={styles.select}
              value={form.categoria}
              onChange={(event) => setForm({ ...form, categoria: event.target.value })}
            >
              {CATEGORIAS.map((categoria) => (
                <option key={categoria.value} value={categoria.value}>
                  {categoria.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="noticia-cuerpo">
              Cuerpo (Markdown)
            </label>
            <textarea
              id="noticia-cuerpo"
              className={styles.textarea}
              required
              value={form.cuerpo}
              onChange={(event) => setForm({ ...form, cuerpo: event.target.value })}
            />
            <p className={styles.hint}>Se publica como Markdown; el HTML embebido no se interpreta.</p>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="noticia-estado">
              Estado
            </label>
            <select
              id="noticia-estado"
              className={styles.select}
              value={form.estado}
              onChange={(event) => setForm({ ...form, estado: event.target.value })}
            >
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado</option>
            </select>
          </div>
          <div className={styles.actions}>
            <button className="button" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : form.id === null ? 'Crear noticia' : 'Guardar cambios'}
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
