import { getVariate } from '../theme/serverUtils'
import { CURRENT_VERSION } from './common'

export const replaceVariate = md => {
  const variates = getVariate(CURRENT_VERSION)
  const variatesKey = Object.keys(variates)

  md.block.ruler.before('paragraph', 'variate_replace', state => {
    variatesKey.forEach(key => {
      for (let i = 0; i < state.tokens.length; i++) {
        const token = state.tokens[i]
        if (token) {
          token.content = token.content.replace(new RegExp(/<%\s*(.*?)\s*%>/, 'g'), (_, $1) => {
            if (variates[$1]) return `${variates[key]}`
            else {
              return `${_}`
            }
          })
        }
      }
    })
  })
}
