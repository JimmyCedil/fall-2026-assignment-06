import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Article = {
  articleId: number
  title: string
  contents: string
}

function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadArticles() {
      setLoading(true)
      setError('')

      try {
        const query = new URLSearchParams({ title_contains: search })
        const response = await fetch(
          `http://localhost:8080/articles?${query}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error('Unable to load articles. Please try again.')
        }

        const data: Article[] = await response.json()

        if (!controller.signal.aborted) {
          setArticles(data)
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

    void loadArticles()

    return () => controller.abort()
  }, [search])

  return (
    <section className="paper">
      <p className="eyebrow">THE READING ROOM</p>
      <h1>Good ideas deserve a margin.</h1>
      <p className="intro">
        A little space to publish articles, trade thoughts, and keep
        the conversation going.
      </p>

      <div className="section-heading">
        <h2>Latest articles</h2>
        <Link className="button" to="/articles/new">
          + Write an article
        </Link>
      </div>

      <div className="search-field">
        <label htmlFor="article-search">Find an article by title</label>
        <input
          id="article-search"
          type="search"
          placeholder="What are you looking for?"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading && <p role="status">Loading articles…</p>}

      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && articles.length === 0 && (
        <p className="notice">
          {search
            ? 'No articles match that title.'
            : 'No articles yet. Be the first to fill a page.'}
        </p>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="article-list">
          {articles.map((article) => (
            <article className="article-card" key={article.articleId}>
              <h2>
                <Link to={`/articles/${article.articleId}`}>
                  {article.title}
                </Link>
              </h2>
              <p>
                {article.contents.length > 180
                  ? `${article.contents.slice(0, 180)}…`
                  : article.contents}
              </p>
              <Link
                className="back-link"
                to={`/articles/${article.articleId}`}
              >
                Read article →
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default ArticleListPage