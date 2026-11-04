import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type ArticleComment = {
  commentId: number
  articleId: number
  body: string
}

type CommentsProps = {
  articleId: number
}

function Comments({ articleId }: CommentsProps) {
  const [comments, setComments] = useState<ArticleComment[]>([])
  const [body, setBody] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editBody, setEditBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const url = `http://localhost:8080/articles/${articleId}/comments`

  useEffect(() => {
    const controller = new AbortController()

    async function loadComments() {
      setLoading(true)
      setLoadError('')

      try {
        const response = await fetch(url, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Unable to load comments.')
        }

        const data: ArticleComment[] = await response.json()

        if (!controller.signal.aborted) {
          setComments(data)
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

    void loadComments()

    return () => controller.abort()
  }, [url])

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!body.trim()) {
      setError('Write a comment before posting.')
      return
    }

    setBusy(true)
    setError('')

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
      })

      if (!response.ok) {
        throw new Error('Unable to post your comment.')
      }

      const comment: ArticleComment = await response.json()
      setComments((current) => [...current, comment])
      setBody('')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editBody.trim()) {
      setError('Your comment cannot be blank.')
      return
    }

    if (editingId === null) return

    setBusy(true)
    setError('')

    try {
      const response = await fetch(`${url}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editBody.trim() }),
      })

      if (!response.ok) {
        throw new Error('Unable to save your comment.')
      }

      const updated: ArticleComment = await response.json()

      setComments((current) =>
        current.map((comment) =>
          comment.commentId === updated.commentId ? updated : comment,
        ),
      )

      setEditingId(null)
      setEditBody('')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(commentId: number) {
    if (!window.confirm('Delete this comment?')) return

    setBusy(true)
    setError('')

    try {
      const response = await fetch(`${url}/${commentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Unable to delete this comment.')
      }

      setComments((current) =>
        current.filter((comment) => comment.commentId !== commentId),
      )

      if (editingId === commentId) {
        setEditingId(null)
        setEditBody('')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="comments-section" aria-labelledby="comments-title">
      <p className="eyebrow">IN THE MARGINS</p>
      <h2 id="comments-title">The conversation</h2>

      {loading && <p role="status">Loading comments…</p>}

      {loadError && (
        <p className="notice" role="alert">{loadError}</p>
      )}

      {!loading && !loadError && (
        <>
          {comments.length === 0 && (
            <p className="notice">No comments yet.</p>
          )}

          <div className="comments-list">
            {comments.map((comment) => (
              <article className="comment-card" key={comment.commentId}>
                {editingId === comment.commentId ? (
                  <form
                    className="article-form"
                    onSubmit={handleEdit}
                    noValidate
                  >
                    <label htmlFor={`edit-comment-${comment.commentId}`}>
                      Edit comment
                    </label>
                    <textarea
                      id={`edit-comment-${comment.commentId}`}
                      value={editBody}
                      onChange={(event) => setEditBody(event.target.value)}
                      rows={3}
                      required
                      disabled={busy}
                    />

                    <div className="comment-actions">
                      <button
                        className="button"
                        type="submit"
                        disabled={busy}
                      >
                        Save comment
                      </button>
                      <button
                        className="button secondary-button"
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setEditingId(null)
                          setEditBody('')
                          setError('')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="comment-body">{comment.body}</p>

                    <div className="comment-actions">
                      <button
                        className="button secondary-button"
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setEditingId(comment.commentId)
                          setEditBody(comment.body)
                          setError('')
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="button danger-button"
                        type="button"
                        disabled={busy}
                        onClick={() => handleDelete(comment.commentId)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>

          <form
            className="article-form"
            onSubmit={handleAdd}
            noValidate
          >
            <label htmlFor="new-comment">Leave a thought</label>
            <textarea
              id="new-comment"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Add your perspective…"
              rows={3}
              required
              disabled={busy}
            />
            <button
              className="button"
              type="submit"
              disabled={busy}
            >
              {busy ? 'Working…' : 'Post comment'}
            </button>
          </form>
        </>
      )}

      {error && (
        <p className="notice" role="alert">{error}</p>
      )}
    </section>
  )
}

export default Comments