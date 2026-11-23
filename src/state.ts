import { createContext, useContext, useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { CartItem, ChatMessage, Product } from './data'
import { demoAccount } from './data'

export interface Order {
  id: string
  items: CartItem[]
  total: number
  date: string
  delivery: string
  payment: string
  recipient?: { name: string; phone: string; address: string }
  note?: string
}

type Setter<T> = Dispatch<SetStateAction<T>>

export interface MarketplaceState {
  cart: CartItem[]
  setCart: Setter<CartItem[]>
  addToCart: (product: Product) => boolean
  ownsListing: (product: Product) => boolean
  favorites: string[]
  toggleFavorite: (id: string) => void
  listings: Product[]
  setListings: Setter<Product[]>
  account: typeof demoAccount
  setAccount: Setter<typeof demoAccount>
  accountId: string
  profiles: Record<string, typeof demoAccount>
  credentials: Record<string, string>
  activateAccount: (id: string, profile?: typeof demoAccount, credential?: string) => void
  signedIn: boolean
  setSignedIn: Setter<boolean>
  followed: boolean
  setFollowed: Setter<boolean>
  messages: ChatMessage[]
  setMessages: Setter<ChatMessage[]>
  orders: Order[]
  setOrders: Setter<Order[]>
  incomingOrders: Order[]
}

export const MarketplaceContext = createContext<MarketplaceState | null>(null)

export function useMarketplace() {
  const state = useContext(MarketplaceContext)
  if (!state) throw new Error('MarketplaceProvider is missing')
  return state
}

export function useStoredState<T>(name: string, initial: T) {
  const key = `beestash:${name}`
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) as T : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // The current session can still use the prototype if storage is unavailable.
    }
  }, [key, value])

  return [value, setValue] as const
}
