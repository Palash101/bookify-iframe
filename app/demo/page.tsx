'use client'

import { useEffect, useState } from 'react'

function DemoPage() {
  return (
    <iframe
      src="http://localhost:3000/widget?embed_origin=https%3A%2F%2Fjimmy.fitnezstudios.com"
      width="100%"
      height="700"
      frameBorder={0}
    ></iframe>
  )
}
export default DemoPage