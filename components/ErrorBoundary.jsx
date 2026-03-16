import { Component } from 'react'
import Link from 'next/link'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('JoyJump error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #87CEEB, #E8F5E9)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 80 }}>🐼</div>
          <p style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 28, color: '#E65100', margin: '12px 0 6px' }}>
            Oops! Something went wrong.
          </p>
          <p style={{ fontFamily: 'Nunito, sans-serif', color: '#555', marginBottom: 24 }}>
            Don't worry — your progress is saved!
          </p>
          <Link href="/">
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                background: 'linear-gradient(135deg, #FB8C00, #E65100)',
                color: 'white', border: 'none', borderRadius: 20,
                padding: '14px 32px', fontSize: 18,
                fontFamily: 'Baloo 2, sans-serif', fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              }}
            >
              Back to JoyJump 🌈
            </button>
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}
