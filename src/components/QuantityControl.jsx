export default function QuantityControl({ value, onChange, min = 1, disabled = false }) {
  const decrease = () => {
    if (value > min) onChange(value - 1)
  }

  const increase = () => {
    onChange(value + 1)
  }

  return (
    <div className={`quantity-control ${disabled ? 'disabled' : ''}`}>
      <button type="button" onClick={decrease} disabled={disabled || value <= min}>
        −
      </button>
      <span>{value}</span>
      <button type="button" onClick={increase} disabled={disabled}>
        +
      </button>
    </div>
  )
}
