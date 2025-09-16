import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />)
    
    // Verifica se a aplicação renderiza
    expect(document.body).toBeTruthy()
  })

  it('should be defined', () => {
    expect(App).toBeDefined()
  })
})
