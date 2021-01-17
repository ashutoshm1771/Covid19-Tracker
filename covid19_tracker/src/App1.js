import React, {useState, useEffect} from 'react';
import './App.css';
import {
  MenuItem,
  FormControl,
  Select, Card , CardContent
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import { sortData , prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import { set } from 'numeral';

function App() {
  const [countries,setCountries] = useState([]);
  const [country,setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData,setTableData] = useState([]);
  const [mapCountries,setMapCountries] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat: 39.80746, lng: -5.4796});
  const [mapZoom, setMapZoom] = useState(2);
  const [casesType,setCasesType] = useState("cases");

  useEffect( () => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    })
  }, [])

  useEffect( () => {
    // async -> send a request, wait for it, do something with it
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then( (response) => response.json())
      .then( (data) => {
        const countries = data.map( (datum) => (
          {
            name: datum.country, // United Kingdom, United States of America
            value: datum.countryInfo.iso2 // UK,USA, IN
          }
        ))
        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
      })
    }
    getCountriesData();
  },[]);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = countryCode === 'worldwide' ? 
    'https://disease.sh/v3/covid-19/all' :
    `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode);
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })
  };

  //console.log(countryInfo);

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 INSPECTOR [ By Ashutosh ]</h1>
          <FormControl className='app__dropdown'>
            <Select variant='outlined' value={country} onChange={onCountryChange}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              { // JSX , JS inside HTML, using Curly Braces
                countries.map(country => (
                  <MenuItem value={country.value}>{country.name}</MenuItem> 
                ))
              }
              {/* Alternative to above method ( Manual entry )
              <MenuItem value="worldwide">Worldwide</MenuItem>
              <MenuItem value="worldwide">Other Options</MenuItem>*/}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats"> 
              <InfoBox onClick={(e) => setCasesType('cases')} title="Coronavirus cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)}/>
              <InfoBox onClick={(e) => setCasesType('recovered')}title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}/>
              <InfoBox onClick={(e) => setCasesType('deaths')}title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}/>
        </div>
        <Map 
          casesType={casesType}
          countries = {mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3>Worldwide new {casesType}</h3>
          <LineGraph casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
