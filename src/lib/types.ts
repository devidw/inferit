import type { Node } from "@xyflow/svelte"

export type Our_Node = Node<{
  id?: string
  thread_id?: string
  src_id?: string
  content?: string
  params?: Params
  param_syncs?: Param_Key[]
}>

export type Params = {
  prompt: string
  model: string
  max_tokens: number
  temperature: number
  top_p: number
  top_k: number
  stop: string
  min_p: number
}

export const default_params: Params = {
  model: "Gemini Nano",
  prompt: "You are a friendly being.",
  max_tokens: 100,
  temperature: 1,
  top_p: 1,
  top_k: 40,
  stop: "\\n",
  min_p: 0,
}

Object.freeze(default_params)

export type Param_Key = keyof Params

export const default_param_syncs: Param_Key[] = Object.keys(
  default_params
) as Param_Key[]

Object.freeze(default_param_syncs)

export type Settings = {
  base_url: string
  api_key: string
  endpoint: "chat" | "completions"
  user_prefix: string
  bot_prefix: string
  browser_ai_offline_fallback: boolean
}

export const default_settings: Settings = {
  base_url: "",
  api_key: "",
  browser_ai_offline_fallback: true,
  endpoint: "chat",
  user_prefix: "user: ",
  bot_prefix: "bot: ",
}

Object.freeze(default_settings)
