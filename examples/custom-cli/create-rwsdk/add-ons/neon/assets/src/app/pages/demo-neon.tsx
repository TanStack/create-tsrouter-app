'use server'
import { getTodos } from '../db'
import DemoNeon from '../components/demo-neon'

export async function NeonDemo() {
  const todos = await getTodos()

  return (
    <>
      <DemoNeon todos={todos!} />
    </>
  )
}
