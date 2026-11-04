import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Comments from '../components/Comments'

type Article = {
  articleId: number
  title: string
  contents: string
}

function ArticleDetailPage() {
  const { articleId } = useParams()
  const navigate = useNavigate()

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadArticle() {
      setLoading(true)
      setError('')
      setDeleteError('')
      setArticle(null)

      try {
        const response = await fetch(
          `http://localhost:8080/articles/${articleId}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? 'This article could not be found.'
              : 'Unable to load this article.',
          )
        }

        const data: Article = await response.json()

        if (!controller.signal.aborted) {
          setArticle(data)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
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

  async function handleDelete() {
    if (!window.confirm('Delete this article and all its comments?')) {
      return
    }

    setDeleting(true)
    setDeleteError('')

    try {
      const response = await fetch(
        `http://localhost:8080/articles/${articleId}`,
        { method: 'DELETE' },
      )

      if (!response.ok) {
        throw new Error('Unable to delete this article. Please try again.')
      }

      navigate('/')
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Something went wrong.',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="paper">
      <Link className="back-link" to="/">
        ← Back to articles
      </Link>

      {loading && <p role="status">Opening article…</p>}

      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && article && (
        <>
          <article>
            <p className="eyebrow">FROM THE NOTEBOOK</p>
            <h1>{article.title}</h1>

            <div className="article-body">{article.contents}</div>

            <div className="article-actions">
              {!deleting && (
                <Link
                  className="button"
                  to={`/articles/${article.articleId}/edit`}
                >
                  Edit article
                </Link>
              )}

              <button
                className="button danger-button"
                type="button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete article'}
              </button>
            </div>

            {deleteError && (
              <p className="notice" role="alert">
                {deleteError}
              </p>
            )}
          </article>

          {!deleting && (
            <Comments
              key={article.articleId}
              articleId={article.articleId}
            />
          )}
        </>
      )}
    </section>
  )
}

export default ArticleDetailPage