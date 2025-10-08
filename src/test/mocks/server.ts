import { setupServer } from 'msw/node'
import { handlers } from './handlers'
import { salesHandlers } from '../contract/sales-handlers'

// Combine all handlers
const allHandlers = [...handlers, ...salesHandlers]

export const server = setupServer(...allHandlers)
