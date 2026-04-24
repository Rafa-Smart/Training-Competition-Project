import {Chart as ChartJs, ArcElement, Tooltip, Legend} from 'chart.js'
import { useState } from 'react'

// ChartJs = core dari si chartnya
// ArcElement = bentuk lingkaran nanti bakal dipake buat bikin donut
// tooltip, biar kalo di hover ada info
// Legend ini untuk label (warna sama nama kategory)

import { Doughnut } from 'react-chartjs-2'

// chart bentuk donut

// NAH INI PENTING
// JAID KTA PERLU REGISTERIN DULU APA APA JAA YANG MAU KITA PAKE
// KALO ENGGA NANTI AKAN ERROR

ChartJs.register(ArcElement, Tooltip, Legend)


export default App(){
  const [chartData, setChartData] = useState([]);
  const [isLoading,setIsLoading] = useState(true); // true awalnya karea pertaa kali mau langusng fetch
  const [error, setError] = useState('');
}