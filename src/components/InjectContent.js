export default function InjectContent({ content, id }) {
  return content.length 
    ? content.filter(c => c.props.id == id) 
    : content.props.id == 'preview-greptimedb-using-docker' 
    ? content : null
}
