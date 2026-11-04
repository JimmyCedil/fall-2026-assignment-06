import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function EditArticlePage() {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [contents, setContents] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadArticle() {
      setLoading(true)
      setLoadError('')

      try {
        const response = await fetch(
          `http://localhost:8080/articles/${articleId}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error('Unable to load this article.')
        }

        const article: { title: string; contents: string } =
          await response.json()

        if (!controller.signal.aborted) {
          setTitle(article.title)
          setContents(article.contents)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setLoadError(
            err instanceof Error ? err.message : 'Something went wrong.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadArticle()
    return () => controller.abort()
  }, [articleId])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim() || !contents.trim()) {
      setError('Please enter both a title and article contents.')
      return
    }

    setError('')
    setSaving(true)

    try {
      const response = await fetch(
        `http://localhost:8080/articles/${articleId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            contents: contents.trim(),
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Unable to save your changes. Please try again.')
      }

      navigate(`/articles/${articleId}`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="paper">
      <Link className="back-link" to={`/articles/${articleId}`}>
        ← Back to article
      </Link>

      <p className="eyebrow">SECOND DRAFT</p>
      <h1>A little room for revision.</h1>

      {loading && <p role="status">Loading your draft…</p>}

      {loadError && (
        <p className="notice" role="alert">{loadError}</p>
      )}

      {!loading && !loadError && (
        <form className="article-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="edit-title">Title</label>
          <input
            id="edit-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            disabled={saving}
          />

          <label htmlFor="edit-contents">Your article</label>
          <textarea
            id="edit-contents"
            rows={10}
            value={contents}
            onChange={(event) => setContents(event.target.value)}
            required
            disabled={saving}
          />

          {error && (
            <p className="notice" role="alert">{error}</p>
          )}

          <button className="button" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      )}
    </section>
  )
}

export default EditArticlePage