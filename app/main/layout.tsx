import Footer from '@/components/screens/Footer'
import Navbar from '@/components/screens/Navbar'
import React, { Children } from 'react'

const layout = ({
    children,
  }: {
    children: React.ReactNode
  }) => {
  return (
    <><div className="sticky top-0 z-50"><Navbar /></div><div>{children}</div><Footer /></>
  )
}

export default layout