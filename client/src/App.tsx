import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import ArticleListPage from './pages/ArticleListPage'
import CreateArticlePage from './pages/CreateArticlePage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import EditArticlePage from './pages/EditArticlePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="notebook">
        <header className="site-header">
          <Link className="brand" to="/">
            <span className="brand-mark" aria-hidden="true">m.</span>
            <span>Margin Notes</span>
          </Link>
          <span className="header-caption">Articles & conversations</span>
        </header>

        <main>
          <Routes>
            <Route
              path="/articles/:articleId/edit"
              element={<EditArticlePage />}
            />
            <Route path="/" element={<ArticleListPage />} />
            <Route path="/articles/new" element={<CreateArticlePage />} />
            <Route
              path="/articles/:articleId"
              element={<ArticleDetailPage />}
            />
            <Route
              path="*"
              element={
                <section className="paper">
                  <h1>This page is missing.</h1>
                  <Link className="back-link" to="/">
                    Return to articles
                  </Link>
                </section>
              }
            />
          </Routes>
        </main>

        <footer className="site-footer">
          <span>Leave room for another perspective.</span>
          <span>Margin Notes / ITSC 3155</span>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App