import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { demoAccount, initialCart, initialListings, initialMessages } from './data'
import type { Product } from './data'
import { MarketplaceContext, useStoredState } from './state'
import type { Order } from './state'

function restoreListing(item: Product): Product {
  if (item.ownerId) return item
  const seed = initialListings.find(product => product.id === item.id)
  return { ...item, ownerId: 'demo', image: item.image ?? seed?.image }
}

export default function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useStoredState('cart', initialCart)
  const [favorites, setFavorites] = useStoredState<string[]>('favorites', [])
  const [storedListings, setStoredListings] = useStoredState('listings', initialListings)
  const listings = storedListings.map(restoreListing)
  const setListings: Dispatch<SetStateAction<Product[]>> = update => {
    setStoredListings(previous => typeof update === 'function' ? update(previous.map(restoreListing)) : update)
  }
  const [legacyAccount] = useStoredState('account', demoAccount)
  const [profiles, setProfiles] = useStoredState('profiles', { demo: legacyAccount } as Record<string, typeof demoAccount>)
  const [accountId, setAccountId] = useStoredState('accountId', 'demo')
  const [credentials, setCredentials] = useStoredState<Record<string, string>>('credentials', {})
  const [signedIn, setSignedIn] = useStoredState('signedIn', false)
  const [followed, setFollowed] = useStoredState('followed', false)
  const [messages, setMessages] = useStoredState('messages', initialMessages)
  const [orders, setOrders] = useStoredState<Order[]>('orders', [])
  const [savedActivity, setSavedActivity] = useStoredState<Record<string, {
    cart: typeof cart; orders: typeof orders; favorites: typeof favorites
    messages: typeof messages; followed: boolean
  }>>('savedActivity', {})

  const account = profiles[accountId] ?? demoAccount
  const incomingOrders = Object.entries(savedActivity)
    .filter(([id]) => id !== accountId)
    .flatMap(([, activity]) => activity.orders.flatMap(order => {
      const items = order.items.filter(item => item.ownerId === accountId)
      if (!items.length) return []
      return [{ ...order, items, total: items.reduce((sum, item) => sum + item.price * item.quantity, 0) }]
    }))
  const ownsListing = (product: Product) => signedIn && product.ownerId === accountId

  function activateAccount(id: string, profile?: typeof demoAccount, credential?: string) {
    if (profile) setProfiles(previous => ({ ...previous, [id]: profile }))
    if (credential) setCredentials(previous => ({ ...previous, [id]: credential }))
    if (id !== accountId) {
      setSavedActivity(previous => ({ ...previous, [accountId]: { cart, orders, favorites, messages, followed } }))
      const activity = savedActivity[id]
      setCart(activity?.cart ?? [])
      setOrders(activity?.orders ?? [])
      setFavorites(activity?.favorites ?? [])
      setMessages(activity?.messages ?? initialMessages)
      setFollowed(activity?.followed ?? false)
    }
    setAccountId(id)
    setSignedIn(true)
  }

  const setAccount: Dispatch<SetStateAction<typeof demoAccount>> = update => {
    setProfiles(previous => ({
      ...previous,
      [accountId]: typeof update === 'function' ? update(previous[accountId] ?? demoAccount) : update,
    }))
  }

  function addToCart(product: Product) {
    if (!signedIn || ownsListing(product) || product.price === null) return false
    const quantity = cart.find(item => item.id === product.id)?.quantity ?? 0
    if (quantity >= (product.stock ?? Infinity)) return false
    const price = product.price

    setCart(items => {
      const existing = items.find(item => item.id === product.id)
      if (existing) {
        return items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...items, { id: product.id, name: product.name, image: product.image, price, quantity: 1 }]
    })
    return true
  }

  function toggleFavorite(id: string) {
    setFavorites(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id])
  }

  return (
    <MarketplaceContext.Provider value={{
      cart, setCart, addToCart, favorites, toggleFavorite, listings, setListings, signedIn, setSignedIn,
      account, setAccount, accountId, profiles, credentials, activateAccount, ownsListing,
      followed, setFollowed, messages, setMessages, orders, setOrders, incomingOrders,
    }}>
      {children}
    </MarketplaceContext.Provider>
  )
}
