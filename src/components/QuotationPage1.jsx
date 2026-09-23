import lithePage1Bg from '../assets/lithe_page1_clean_bg.png'
import fewdaysPage1Bg from '../assets/fewdays_page1_clean_bg.png'

export default function QuotationPage1({ quotation, scale = 1, id = 'quotation-page-1', company: forcedCompany }) {
  const company = forcedCompany || quotation?.company || 'naj'
  const isFewdays = company === 'fewdays'

  if (isFewdays) {
    let clientName = quotation?.clientName?.trim()
    if (!clientName) {
      clientName = quotation?.brideName?.trim() || quotation?.groomName?.trim() || 'Safwan'
    }
    const greeting = clientName.toLowerCase().startsWith('hello ')
      ? (clientName.endsWith(',') ? clientName : `${clientName},`)
      : `Hello ${clientName},`

    return (
      <div
        id={id}
        className="pdf-template-page1 fewdays-theme"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
        }}
      >
        <img
          src={fewdaysPage1Bg}
          alt="Page 1"
          className="fewdays-page1-bg"
          aria-hidden="true"
        />
        <div className="fewdays-page1-greeting">
          {greeting}
        </div>
      </div>
    )
  }

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

