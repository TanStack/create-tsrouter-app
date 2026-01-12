'use server'
import { neon } from '@neondatabase/serverless'

let client: ReturnType<typeof neon>

export async function getClient() {
  if (!process.env.VITE_DATABASE_URL) {
    return undefined
  }
  if (!client) {
    client = await neon(process.env.VITE_DATABASE_URL!)
  }
  return client
}

export async function getTodos() {
  const client = await getClient()
  if (!client) {
    return undefined
  }
  return (await client.query(`SELECT * FROM todos`)) as Array<{
    id: number
    title: string
  }>
}

export async function insertTodo(title: string) {
  const client = await getClient()
  if (!client) {
    return undefined
  }
  await client.query(`INSERT INTO todos (title) VALUES ($1)`, [title])
}

export async function deleteTodo(id: number) {
  const client = await getClient()
  if (!client) {
    return undefined
  }
  await client.query(`DELETE FROM todos WHERE id = $1`, [id])
}
