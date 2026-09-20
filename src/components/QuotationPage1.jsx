import lithePage1Bg from '../assets/lithe_page1_clean_bg.png'

export default function QuotationPage1({ quotation, scale = 1, id = 'quotation-page-1' }) {
  let greeting = quotation?.greeting?.trim()
  if (!greeting) {
    const rawName =
      quotation?.clientName?.trim() ||
      quotation?.brideName?.trim() ||
      quotation?.groomName?.trim()
    if (rawName) {
      greeting = rawName.toLowerCase().startsWith('hi ') ? rawName : `Hi ${rawName}`
    } else {
      greeting = ''
    }
  }

  return (
    <div
      id={id}
      className="pdf-template-page1 litheads-theme"
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
      }}
    >
      <img
        src={lithePage1Bg}
        alt=""
        className="litheads-page1-bg"
        aria-hidden="true"
      />
      {greeting ? (
        <div className="litheads-page1-greeting">
          {greeting}
        </div>
      ) : null}
    </div>
  )
}

