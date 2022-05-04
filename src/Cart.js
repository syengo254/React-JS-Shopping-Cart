import styles from './Cart.module.css';
import { LoadingIcon } from './Icons';
import { getProducts } from './dataService';
import { useEffect, useState } from 'react';

const formatAmount = amt => {
  return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2}).format(amt);
}

const Product = ({ id, name, availableCount, price, orderedQuantity, total, updateQuantity }) => {
  const addBtnDisabled = orderedQuantity === availableCount;
  const subBtnDisabled = orderedQuantity < 1;
  
  return (
    <tr>
      <td>{id}</td>
      <td>{name}</td>
      <td>{availableCount}</td>
      <td>${price}</td>
      <td>{orderedQuantity}</td>   
      <td>${formatAmount(total)}</td>
      <td>
        <button disabled={addBtnDisabled} onClick={ () => updateQuantity(id, 'add')} className={styles.actionButton}>+</button>
        <button disabled={subBtnDisabled} onClick={ () => updateQuantity(id, 'sub')} className={styles.actionButton}>-</button>
      </td>
    </tr>    
  );
}


const Checkout = () => {
  const [ products, setProducts ] = useState({});
  const [loading, setLoading ] = useState(false);
  
  const getSummary = () => {
    let total = Object.values(products).reduce( (prev, curr) => prev + curr.total, 0);
    console.log(total);
    let discount = total > 1000 ? total * 0.1 : 0; 
    total = total > 1000 ? total * 0.9 : total;

    return {
      total,
      discount,
    };
  }

  const summary = getSummary();

  const updateQuantity = (productId, action) => {
    if(action === 'add'){
      let p = products[productId];
      p.orderedQuantity += 1;
      p.total = p.orderedQuantity * p.price;

      setProducts({...products, [productId]:p})
    }

    if(action === 'sub'){
      let p = products[productId];
      p.orderedQuantity -= 1;
      p.total = p.orderedQuantity * p.price;
      
      setProducts({...products, [productId]:p})
    }
  }

  useEffect( () => {
    setLoading(true);
    getProducts()
      .then( res => {
        const normalized = {};

        res.forEach( product => {
          let p = {...product, orderedQuantity: 0, total: 0 }
          normalized[product.id] = p;
        });

        setProducts(normalized);
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
            Object.values(products).map( product => <Product key={product.id} {...product} updateQuantity={updateQuantity} />)
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