import hygraphClient, { gql } from './hygraph-client.js'

// TODO: get this from hygraph instead
// Average review.rating for a product
function averageRating({data: reviews}) {

  const total = reviews.reduce((acc, review) => acc + review.rating, 0)
  return Math.floor(total / reviews.length)
}

export async function getSomeProducts(count = 4) {

  const query = gql`
  query GetSomeProducts($count: Int!) {
    products(first: $count) {
    productName
    productSlug
    productImage {
      url
      height
      width
      altText
    }
    reviews {
      data {
        id
        name
        rating
        comment
      }
    }
  }
  }
`

try {
  const {products} = await hygraphClient.request(query, {count})
  
  return products
} catch (error) {
  console.log({error})
}

}

export async function allProducts() {
    const query = gql`query GetAllSlugs {
      products
      {
        productName
        id
        productSlug
        
      }
    }
      `

        try {
            const {bikes} = await hygraphClient.request(query)
            
            return bikes
        } catch (error) {
            console.log(error)
        }


}

export async function getProductBySlug(slug, preview=false) {
  console.log({preview})
    const query = gql`
    query GetSingleProduct($slug: String!, $stage: Stage!) {
  product(where: {productSlug: $slug}, stage: $stage) {
    productName
    productSlug
    productPrice
    productDescription {
      html
    }
    reviews {
      data {
        id
        name
        rating
        comment
      }
    }
    productCategories {
      id
      slug
      categoryName
    }
    productImage {
      altText
      url
    }
  }
}

      `
        try {
            if (preview) hygraphClient.setHeader('Authorization', `Bearer ${process.env.HYGRAPH_PREVIEW_TOKEN}`)
      
            let {product} = await hygraphClient.request(query, {slug, stage: preview ? 'DRAFT' : 'PUBLISHED'})
            product.averageRating = averageRating(product.reviews)

            return product
        } catch (error) {
            console.log(error)
        }
}
  

export async function getPreviewProductBySlug(slug) {
  console.log('we\'re running the preview slug getter')
  const data = await getProductBySlug(slug, true)

  return data
}
