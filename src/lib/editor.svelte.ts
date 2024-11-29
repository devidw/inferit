export const editor_state: {
  ongoing_session: boolean
  node_id: string | null
  content: string
} = $state({
  ongoing_session: false,
  node_id: null,
  content: "",
})
