import { ApolloServer } from 'apollo-server'
import { loadTypeSchema } from './utils/schema'
import { authenticate } from './utils/auth'
import { merge } from 'lodash'
import config from './config'
import { connect } from './db'
import product from './types/product/product.resolvers'
import coupon from './types/coupon/coupon.resolvers'
import user from './types/user/user.resolvers'

const types = ['product', 'coupon', 'user']

export const start = async () => {
  const rootSchema = `
  type Cat {
    name:String,
    food:String,
    bestFriend:Cat
  }


  type Query {
    myCat: Cat
    hello: String
  }
  type Schema {
    query: Query
  }
  `
  const schemaTypes = await Promise.all(types.map(loadTypeSchema))

  const server = new ApolloServer({
    // typeDefs: [rootSchema, ...schemaTypes],
    typeDefs: [rootSchema],
    resolvers: {
      Query: {
        myCat() {
          return {
            name: 'Garfield',
            food: 'Carne',
            bestFriend: {
              name: 'Mimo'
            }
          }
        },
        hello() {
          return {
            hello: 'Hello'
          }
        }
      }
    },
    async context({ req }) {
      const user = await authenticate(req)
      return { user }
    }
  })

  await connect(config.dbUrl)
  const { url } = await server.listen({ port: config.port })

  console.log(`GQL server ready at ${url}`)
}
