import { get_encoding } from "tiktoken"

const enc = get_encoding("gpt2")

export function get_token_count(text: string) {
  return enc.encode(text).length
}
