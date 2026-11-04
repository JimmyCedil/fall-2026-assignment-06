import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function CreateArticlePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [contents, setContents] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim() || !contents.trim()) {
      setError('Please enter both a title and article contents.')
      return
    }

    setError('')
    setSaving(true)

    try {
      const response = await fetch('http://localhost:8080/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          contents: contents.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Unable to publish your article. Please try again.')
      }

      const article: { articleId: number } = await response.json()
      navigate(`/articles/${article.articleId}`)
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
      <Link className="back-link" to="/">
        ← Back to articles
      </Link>

      <p className="eyebrow">A FRESH PAGE</p>
      <h1>Put your idea into words.</h1>

      <form className="article-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="article-title">Title</label>
        <input
          id="article-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Give your idea a headline"
          required
          disabled={saving}
        />

        <label htmlFor="article-contents">Your article</label>
        <textarea
          id="article-contents"
          rows={10}
          value={contents}
          onChange={(event) => setContents(event.target.value)}
          placeholder="Start writing here…"
          required
          disabled={saving}
        />

        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}

        <button className="button" type="submit" disabled={saving}>
          {saving ? 'Publishing…' : 'Publish article'}
        </button>
      </form>
    </section>
  )
}

export default CreateArticlePage