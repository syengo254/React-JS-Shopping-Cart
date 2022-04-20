import styles from './Cart.module.css';
import { LoadingIcon } from './Icons';
import { getProducts } from './dataService';
import { useEffect, useState } from 'react';

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