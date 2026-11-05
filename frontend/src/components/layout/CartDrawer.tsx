import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { SkuGradient } from '../ui/SkuGradient';
import { QuantityStepper } from '../ui/QuantityStepper';
import { EmptyState } from '../ui/EmptyState';
import { formatPrice } from '../../lib/formatters';
import styles from './CartDrawer.module.css';

export const CartDrawer: React.FC = () => {
  const { items, isDrawerOpen, closeDrawer, updateQty, removeFromCart, totalAmount, itemCount } =
    useCart();
  const navigate = useNavigate();

  const handleGoToCart = () => {
    closeDrawer();
    navigate('/cart');
  };

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      title={`Shopping Cart (${itemCount})`}
      position="right"
      footer={
        items.length > 0 ? (
          <div className={styles.footerSummary}>
            <div className={styles.summaryRow}>
              <span>Items Subtotal:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Estimated Shipping:</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Free Pickup</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`}>
              <span>Total:</span>
              <span style={{ color: 'var(--primary)' }}>{formatPrice(totalAmount)}</span>
            </div>

            <div className={styles.actions}>
              <Button
                variant="primary"
                fullWidth
                rightIcon={<ArrowRight size={16} />}
                onClick={handleGoToCart}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={32} />}
          title="Your cart is empty"
          description="Browse the catalog to add warehouse packing supplies to your cart."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                closeDrawer();
                navigate('/products');
              }}
            >
              Explore Products
            </Button>
          }
        />
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.productId} className={styles.item}>
              <SkuGradient sku={item.sku} name={item.name} size="sm" />

              <div className={styles.itemDetails}>
                <div className={styles.itemName} title={item.name}>
                  {item.name}
                </div>
                <div className={styles.itemSku}>{item.sku}</div>
                <div className={styles.itemPrice}>{formatPrice(item.price)}</div>
              </div>

              <div className={styles.itemControls}>
                <QuantityStepper
                  value={item.qty}
                  min={1}
                  max={item.stockQty}
                  onChange={(val) => updateQty(item.productId, val)}
                  ariaLabel={`quantity for ${item.name}`}
                />

                <IconButton
                  icon={<Trash2 size={16} />}
                  ariaLabel={`Remove ${item.name} from cart`}
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCart(item.productId, true)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};

