import styles from './Checkout.module.css';
import { LoadingIcon } from './Icons';
import { getProducts } from './dataService';
import { useEffect, useState } from 'react';

// You are provided with an incomplete <Checkout /> component.
// You are not allowed to add any additional HTML elements.
// You are not allowed to use refs.

// Demo video - You can view how the completed functionality should look at: https://drive.google.com/file/d/1o2Rz5HBOPOEp9DlvE9FWnLJoW9KUp5-C/view?usp=sharing

// Once the <Checkout /> component is mounted, load the products using the getProducts function.
// Once all the data is successfully loaded, hide the loading icon.
// Render each product object as a <Product/> component, passing in the necessary props.
// Implement the following functionality:
//  - The add and remove buttons should adjust the ordered quantity of each product
//  - The add and remove buttons should be enabled/disabled to ensure that the ordered quantity can’t be negative and can’t exceed the available count for that product.
//  - The total shown for each product should be calculated based on the ordered quantity and the price
//  - The total in the order summary should be calculated
//  - For orders over $1000, apply a 10% discount to the order. Display the discount text only if a discount has been applied.
//  - The total should reflect any discount that has been applied
//  - All dollar amounts should be displayed to 2 decimal places



const Product = ({ id, name, availableCount, price, orderedQuantity, total, updateSummary, formatAmount }) => {
  const addBtnDisabled = availableCount - orderedQuantity === 0;
  const subBtnDisabled = orderedQuantity === 0;
  return (
    <tr>
      <td>{id}</td>
      <td>{name}</td>
      <td>{availableCount}</td>
      <td>${price}</td>
      <td>{orderedQuantity}</td>   
      <td>${formatAmount(total)}</td>
      <td>
        <button disabled={addBtnDisabled} onClick={ () => updateSummary(id, 'add')} className={styles.actionButton}>+</button>
        <button disabled={subBtnDisabled} onClick={ () => updateSummary(id, 'sub')} className={styles.actionButton}>-</button>
      </td>
    </tr>    
  );
}


const Checkout = () => {
  const [ products, setProducts ] = useState([]);
  const [loading, setLoading ] = useState(false);
  const [ summary, setSummary ] = useState({
    total: 0,
    discount: 0,
  });

  const updateSummary = (productId, action) => {
    setProducts( products.map( product => {
      if(product.id === productId){

        if(action === 'add'){
          product.orderedQuantity += 1;
          product.total = product.orderedQuantity * product.price;
        }
        else if(action === 'sub'){
          product.orderedQuantity -= 1;
          product.total = product.orderedQuantity * product.price;
        }
      }
  
      return product;
    }));
  }

  function formatAmount(amt){
    return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2}).format(amt);
  }

  useEffect(() => {
    const total = products.reduce( (val, product) => {
      val += product.total;
      return val;
    }, 0);

    setSummary({
      discount: total > 1000 ? total * 0.1 : 0,
      total: total > 1000 ? (total * 0.9) : total,
    });
  }, [products]);

  useEffect( () => {
    setLoading(true);
    getProducts()
      .then( res => {
        setProducts( res.map( product => {
          product.total = 0;
          product.orderedQuantity = 0;

          return product;
        }));
      })
      .catch( e => console.log(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className={styles.header}>        
        <h1>Electro World</h1>        
      </header>
      <main>
        { loading && <LoadingIcon /> } 
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th># Available</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          {
            products.map( product => <Product key={product.id} {...product} formatAmount={formatAmount} updateSummary={updateSummary} />)
          }
          </tbody>
        </table>
        <h2>Order summary</h2>
        { summary.discount > 0 ? <p>Discount: $ {formatAmount(summary.discount)}</p> : null }
        <p>Total: $ { formatAmount(summary.total)}</p>       
      </main>
    </div>
  );
};

export default Checkout;