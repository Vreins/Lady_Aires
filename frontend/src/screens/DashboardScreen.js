import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { summaryOrder } from '../actions/orderActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import * as d3 from 'd3';

export default function DashboardScreen() {
  const orderSummary = useSelector((state) => state.orderSummary);
  const { loading, summary, error } = orderSummary;
  const dispatch = useDispatch();
  
  const salesChartRef = useRef(null);
  const categoriesChartRef = useRef(null);

  useEffect(() => {
    dispatch(summaryOrder());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && summary) {
      // Render Sales Chart
      if (summary.dailyOrders.length > 0) {
        renderSalesChart(summary.dailyOrders);
      }
      // Render Categories Chart
      if (summary.productCategories.length > 0) {
        renderCategoriesChart(summary.productCategories);
      }
    }
  }, [loading, summary]);

  const renderSalesChart = (data) => {
    const svg = d3.select(salesChartRef.current);
    svg.selectAll('*').remove(); // Clear previous chart

    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d._id)))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales)])
      .nice()
      .range([height, 0]);

    const svgContent = svg
      .attr('viewBox', `0 0 800 400`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    svgContent
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%Y-%m-%d')))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svgContent.append('g').call(d3.axisLeft(y));

    svgContent
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .line()
          .x((d) => x(new Date(d._id)))
          .y((d) => y(d.sales))
      );
  };

  const renderCategoriesChart = (data) => {
    const svg = d3.select(categoriesChartRef.current);
    svg.selectAll('*').remove(); // Clear previous chart

    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;

    const pie = d3
      .pie()
      .value((d) => d.count)(data);

    const arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svgContent = svg
      .attr('viewBox', `0 0 400 400`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    svgContent
      .selectAll('path')
      .data(pie)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data._id))
      .attr('stroke', '#fff')
      .style('stroke-width', '2px');
  };

  return (
    <div>
  <div className="row">
    <h1>Dashboard</h1>
  </div>
  {loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <>
      <ul className="row summary">
        <li>
          <div className="summary-title color1">
            <span>
              <i className="fa fa-users" /> Users
            </span>
          </div>
          <div className="summary-body">{summary.users[0].numUsers}</div>
        </li>
        <li>
          <div className="summary-title color2">
            <span>
              <i className="fa fa-shopping-cart" /> Orders
            </span>
          </div>
          <div className="summary-body">
            {summary.orders[0] ? summary.orders[0].numOrders : 0}
          </div>
        </li>
        <li>
          <div className="summary-title color3">
            <span>
              <i className="fa fa-money" /> Sales
            </span>
          </div>
          <div className="summary-body">
            $
            {summary.orders[0]
              ? summary.orders[0].totalSales.toFixed(2)
              : 0}
          </div>
        </li>
      </ul>
      <div className="charts-container">
        <div className="chart">
          <h2>Sales</h2>
          {summary.dailyOrders.length === 0 ? (
            <MessageBox>No Sale</MessageBox>
          ) : (
            <svg ref={salesChartRef}></svg>
          )}
        </div>
        <div className="chart">
          <h2>Categories</h2>
          {summary.productCategories.length === 0 ? (
            <MessageBox>No Category</MessageBox>
          ) : (
            <svg ref={categoriesChartRef}></svg>
          )}
        </div>
      </div>
    </>
  )}
</div>
  );
}
