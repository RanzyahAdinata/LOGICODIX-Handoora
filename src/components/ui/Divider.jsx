const Divider = ({ text = 'ATAU' }) => {
  return (
    <div className="flex items-center justify-center my-6 select-none">
      <span className="text-[11px] font-extrabold text-[#A6A6A6] tracking-wider uppercase">
        {text}
      </span>
    </div>
  )
}

export default Divider
