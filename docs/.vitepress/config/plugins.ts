import { getVariate } from '../theme/serverUtils'
import { CURRENT_VERSION } from './common'

export const replaceVariate = md => {
  const variates = getVariate(CURRENT_VERSION)
  const variatesKey = Object.keys(variates)

  md.core.ruler.push('variate_replace', state => {
    variatesKey.forEach(key => {
      for (let i = 0; i < state.tokens.length; i++) {
        const token = state.tokens[i]
        if (token) {
          token.content.replace(new RegExp(key, 'g'), () => {})
          token.content = token.content.replace(new RegExp(`<{${key}}>`, 'g'), () => {
            return variates[key]
          })
          if (token.content.includes(variates[key])) {
            console.log(`token.content:`, token.content)
            console.log(`state.tokens[i].content:`, state.tokens[i].content)
          }
        }
      }
    })
  })
}
