import { Component } from 'react'

const boxStyle = {
  minHeight: '60vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
  padding: '32px 16px',
  textAlign: 'center',
  fontFamily: 'Cairo, sans-serif',
}

const btnStyle = {
  borderRadius: 12,
  padding: '10px 22px',
  fontWeight: 800,
  fontSize: 14,
  cursor: 'pointer',
  border: 'none',
}

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('App crashed:', error)
  }

  render() {
    if (!this.state.error) return this.props.children
    const base = import.meta.env.BASE_URL || '/'
    return (
      <div style={boxStyle}>
        <div style={{ fontSize: 40 }}>😵</div>
        <h2 style={{ margin: 0, fontSize: 22, color: '#4a0f3f' }}>
          حصلت مشكلة غير متوقعة
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: '#4a0f3f99', maxWidth: 420 }}>
          آسفين، حدث خطأ أثناء عرض الصفحة. بياناتك سليمة — جرّب تحديث الصفحة أو
          ارجع للرئيسية.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            style={{ ...btnStyle, background: '#7c1d4f', color: '#fdefd4' }}
            onClick={() => window.location.reload()}
          >
            تحديث الصفحة
          </button>
          <button
            style={{ ...btnStyle, background: '#f3e8d8', color: '#4a0f3f', border: '1px solid #d9c3a8' }}
            onClick={() => {
              window.location.href = base
            }}
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    )
  }
}
