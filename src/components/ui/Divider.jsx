const Divider = ({ text = 'ATAU' }) => {
  return (
    <div className="flex items-center justify-center my-6 select-none">
      <span className="text-xs font-black text-[#888888] tracking-wider uppercase">
        {text}
      </span>
    </div>
  )
}

export default Divider
