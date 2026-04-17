export interface GreetOptions {
  name?: string
  greeting?: string
}

export function greet(options: GreetOptions): string {
  const name = options.name ?? 'world'
  const greeting = options.greeting ?? 'Hello'
  return `${greeting}, ${name}!`
}
