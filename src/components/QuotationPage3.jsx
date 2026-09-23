import fewdaysPage3Bg from '../assets/fewdays_page3_clean_bg.png'

export default function QuotationPage3({ quotation, scale = 1, id = 'quotation-page-3', company: forcedCompany }) {
  return (
    <div
      id={id}
      className="pdf-template-page3 fewdays-theme"
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
      }}
    >
      <img
        src={fewdaysPage3Bg}
        alt="Page 3"
        className="fewdays-page3-bg"
        aria-hidden="true"
      />
    </div>
  )
}
