let eventBus = new Vue()

Vue.component('product', {
    props: {
      premium: {
        type: Boolean,
        required: true
      }
    },
    template: `
     <div class="product">
          
        <div class="product-image">
          <img :src="image" />
        </div>
  
        <div class="product-info">
            <h1>{{ title }}</h1>
            <p v-if="inStock">In Stock</p>
            <p v-else>Out of Stock</p>
  
            
  
            <div class="color-box"
                 v-for="(variant, index) in variants" 
                 :key="variant.variantId"
                 :style="{ backgroundColor: variant.variantColor }"
                 @mouseover="updateProduct(index)"
                 >
            </div> 
  
            <div class="change_cart">
              <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Add to cart
            </button>

            <button v-on:click="removeToCart" :class="{ disabledButton: !inStock }">Remove to cart
            </button>
          </div>

  
         </div> 

         <product-tabs :reviews="reviews"></product-tabs> 
      
      </div>
     `,
    data() {
      return {
          product: 'Socks',
          brand: 'Vue Mastery',
          selectedVariant: 0,
          variants: [
            {
              variantId: 2234,
              variantColor: 'green',
              variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-green-onWhite.jpg',
              variantQuantity: 10     
            },
            {
              variantId: 2235,
              variantColor: 'blue',
              variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-blue-onWhite.jpg',
              variantQuantity: 0     
            }
          ],
          reviews: []
      }
    },
      methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct(index) {  
            this.selectedVariant = index
        },
        removeToCart: function() {
          this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        },
        sortedReviews() {
          return this.reviews.sort((a, b) => b.priority - a.priority);
        }
      },
      computed: {
          title() {
              return this.brand + ' ' + this.product  
          },
          image(){
              return this.variants[this.selectedVariant].variantImage
          },
          inStock(){
              return this.variants[this.selectedVariant].variantQuantity
          },
          shipping() {
            if (this.premium) {
              return "Free"
            }
              return 2.99
          }
      },
      mounted() {
        eventBus.$on('review-submitted', productReview => {
          this.reviews.push(productReview)
        })
      }
  })


  Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">

      <p class="error" v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>

      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name">
      </p>

      <p>
        <label for="review">Review:</label>      
        <textarea id="review" v-model="review"></textarea>
      </p>

      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>10</option>
          <option>9</option>
          <option>8</option>
          <option>7</option>
          <option>6</option>
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

      <p>Would you recommend this product?</p>
      <label>
        Yes
        <input type="radio" name="vibor" value="Yes" v-model="recommend"/>
      </label>
      <label>
        No
        <input type="radio" name="vibor" value="No" v-model="recommend"/>
      </label>


      <p>
        <input type="submit" value="Submit">  
      </p>    
  
    </form>
    `,
    data() {
      return {
        name: null,
        review: null,
        rating: null,
        errors: []
      }
    },
    methods: {
      onSubmit() {
        this.errors = []
        if (this.name && this.review && this.rating) {
          let productReview = {
            name: this.name,
            review: this.review,
            rating: this.rating,
            priority: this.rating
          }
          eventBus.$emit('review-submitted', productReview)
          this.name = null
          this.review = null
          this.rating = null
        }
        else {
          if(!this.name) this.errors.push("Name required.")
          if(!this.review) this.errors.push("Review required.")
          if(!this.rating) this.errors.push("Rating required.")
        }
      },
      updatePriority() {
        this.$emit('update-priority', this.selectedPriority);
      }
    },
    computed: {
      cardColor() {
        if (this.selectedPriority >= 1 && this.selectedPriority <= 5) {
          return 'green';
        } else if (this.selectedPriority >= 6 && this.selectedPriority <= 10) {
          return 'red';
        } 
      }
    }
  })

  Vue.component('product-tabs', {
    props: {
      reviews: {
        type: Array,
        required: false
      },
      premium: {
        type: Boolean,
        required: true
      }
    },
    template: `
      <div>
        <ul>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>
  
        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul v-else>
              <li v-for="(review, index) in sortedReviews" :key="index" :style="{ color: reviewColors[index] }">
                <p>{{ review.name }}</p>
                <p>Rating: {{ review.rating }}</p>
                <p>{{ review.review }}</p>
              </li>
            </ul>
        </div>
  
        <div v-show="selectedTab === 'Make a Review'">   
          <product-review></product-review>
        </div>
  
        <div v-show="selectedTab === 'Shipping'">
          <p>{{ shipping }}</p>
        </div>
  
        <div v-show="selectedTab === 'Details'">
          <ul>
            <li v-for="detail in details">{{ detail }}</li>
          </ul>
        </div>
    
      </div>
    `,
    data() {
      return {
        tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
        selectedTab: 'Reviews',
        details: ['80% cotton', '20% polyester', 'Gender-neutral'],
      };
    },
    computed: {
      shipping() {
        return this.premium ? "Free" : 2.99;
      },
      sortedReviews() {
        return this.reviews.sort((a, b) => b.priority - a.priority);
      },
      reviewColors() {
        return this.sortedReviews.map(review => {
          if (review.priority >= 1 && review.priority <= 5) {
            return 'green';
          } else if (review.priority >= 6 && review.priority <= 10) {
            return 'red';
          } else {
            return '';
          }
        });
      }
    }
  })
  
  let app = new Vue({
      el: '#app',
      data: {
        premium: true,
        cart: []
      },
      methods: {
        updateCart(id) {
          this.cart.push(id)
        },
        removeCart(id) {
          this.cart.pop(id)
        },
        removeItem(id) {
          for(var i = this.cart.length - 1; i >= 0; i--) {
            if (this.cart[i] === id) {
               this.cart.splice(i, 1);
            }
          }
        }
      }
  })