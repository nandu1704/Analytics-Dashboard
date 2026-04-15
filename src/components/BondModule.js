import React, { useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TOP_OPTIONS = ["bonds", "swap rates"];
const CURRENCIES = ["CAD", "USD", "EUR", "GBP"];
const BOND_ATTRIBUTES = ["yield", "spd_z", "spd_pp", "yield_rv", "price", "spd_yy"];
const NAV_PERIODS = ["1m", "3m", "6m"];
const TIME_RANGES = ["1m", "3m", "6m", "ytd", "1y", "2y", "5y", "10y", "all"];
const BOND_COLUMNS = [
  "yield",
  "price",
  "carry3m",
  "rolldown3m",
  "spd_pp",
  "spd_yy",
  "spd_z",
  "spd_pp_xccy",
  "spd_goc",
  "spd_goc_rvs",
  "spd_pp_rvs",
  "spd_yy_rvs",
  "yield_rvs",
];
const SWAP_COLUMNS = [
  "crr",
  "str",
  "chg",
  "zscore",
  "stdev_d",
  "chg/stdev",
  "MR Ret",
  "Exp Ret",
  "Mr Freq",
  "1 std MR Freq",
  "ADF stat",
  "Hurst Stat",
  "RSI",
];
const SWAP_VALUE_COLUMNS = SWAP_COLUMNS.slice(2);
const CURVE_COLORS = ["#f59e0b", "#22c55e", "#3b82f6", "#ef4444", "#a855f7", "#06b6d4"];
const SERIES_COLORS = ["#84cc16", "#22c55e", "#f59e0b", "#3b82f6", "#a855f7"];
const MATURITIES = ["3M", "6M", "1Y", "2Y", "3Y", "5Y", "7Y", "10Y", "20Y", "30Y"];

const BOND_CATEGORY_BY_CURRENCY = {
  CAD: ["CAN Housing Trust CAD", "Canada GOVT CAD", "Manitoba Province CAD", "Ontario Province CAD", "Quebec Province CAD"],
  USD: ["US Treassury N/B USD", "Alberta Province USD", "Quebec Province USD", "Ontario Province USD", "Michigan Province USD", "Manitoba Province USD"],
  EUR: ["Ontario Province EUR", "Alberta Province EUR", "Manitoba Province EUR", "Quebec Province EUR", "Ontario Province EUR", "Michigan Province EUR"],
  GBP: ["Ontario Province GBP", "Quebec Province GBP"],
};


const SWAP_STRUCTURES_BY_CURRENCY = {
  CAD: [
    "1Y CORRA",
    "2Y CORRA",
    "5Y CORRA",
    "10Y CORRA",
    "5Y5Y CORRA",
    "2Y5Y CORRA",
    "5Y10Y CORRA",
    "1Y2Y CORRA",
    "2Y Butterfly",
    "5Y Butterfly",
    "5Y Swap Spread",
  ],
  USD: [
    "1Y SOFR",
    "2Y SOFR",
    "5Y SOFR",
    "10Y SOFR",
    "5Y5Y SOFR",
    "2Y5Y SOFR",
    "5Y10Y SOFR",
    "1Y2Y SOFR",
    "2Y Butterfly",
    "5Y Butterfly",
    "5Y Swap Spread",
  ],
  EUR: [
    "1Y ESTR",
    "2Y ESTR",
    "5Y ESTR",
    "10Y ESTR",
    "5Y5Y ESTR",
    "2Y5Y ESTR",
    "5Y10Y ESTR",
    "1Y2Y ESTR",
    "2Y Butterfly",
    "5Y Butterfly",
    "5Y Swap Spread",
  ],
  GBP: [
    "1Y SONIA",
    "2Y SONIA",
    "5Y SONIA",
    "10Y SONIA",
    "5Y5Y SONIA",
    "2Y5Y SONIA",
    "5Y10Y SONIA",
    "1Y2Y SONIA",
    "2Y Butterfly",
    "5Y Butterfly",
    "5Y Swap Spread",
  ],
};

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seeded(seed, min, max, decimals = 2) {
  const value = min + ((seed % 1000) / 1000) * (max - min);
  return Number(value.toFixed(decimals));
}

function getFieldSx(isDark, width) {
  return {
    width,
    minWidth: width,
    "& .MuiOutlinedInput-root": {
      height: 30,
      fontSize: 12,
      color: isDark ? "#f4f4f5" : "#111827",
      backgroundColor: isDark ? "#18181b" : "#ffffff",
      borderRadius: 2,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: isDark ? "#3f3f46" : "#d1d5db",
    },
    "& .MuiSvgIcon-root": {
      color: isDark ? "#a1a1aa" : "#6b7280",
    },
    "& .MuiSelect-select": { py: 0.5 },
  };
}

function SingleSelect({ value, onChange, options, placeholder, width = 130, isDark }) {
  return (
    <FormControl size="small" sx={getFieldSx(isDark, width)}>
      <Select
        value={value}
        displayEmpty
        onChange={onChange}
        input={<OutlinedInput />}
        IconComponent={ExpandMoreIcon}
        renderValue={(selected) => (selected ? selected : placeholder)}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: isDark ? "#09090b" : "#ffffff",
              color: isDark ? "#f4f4f5" : "#111827",
              border: `1px solid ${isDark ? "#27272a" : "#e5e7eb"}`,
            },
          },
        }}
      >
        <MenuItem value="" disabled>{placeholder}</MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function MultiSelect({ options, value, onChange, width = 190, isDark }) {
  return (
    <FormControl size="small" sx={getFieldSx(isDark, width)}>
      <Select
        multiple
        value={value}
        onChange={onChange}
        input={<OutlinedInput />}
        displayEmpty
        IconComponent={ExpandMoreIcon}
        renderValue={(selected) => (selected.length ? selected.join(", ") : "Categories")}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: isDark ? "#09090b" : "#ffffff",
              color: isDark ? "#f4f4f5" : "#111827",
              border: `1px solid ${isDark ? "#27272a" : "#e5e7eb"}`,
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={value.includes(option)} size="small" sx={{ color: isDark ? "#a1a1aa" : "#6b7280", p: 0.5, mr: 1 }} />
            <ListItemText primary={option} primaryTypographyProps={{ fontSize: 12 }} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function buildBondCurve(currency, category, attribute, period) {
  const seed = hashCode(`${currency}-${category}-${attribute}-${period}`);
  const shift = period === "1m" ? 0.05 : period === "3m" ? 0.18 : 0.32;
  return MATURITIES.map((maturity, index) => ({
    maturity,
    value: Number((2.2 + index * 0.16 + ((seed + index * 41) % 19) / 18 + (hashCode(category) % 17) / 22 + shift).toFixed(2)),
  }));
}

function mergeBondSeries(series) {
  return MATURITIES.map((maturity, index) => {
    const row = { maturity };
    series.forEach((item) => {
      row[item.category] = item.data[index]?.value ?? null;
    });
    return row;
  });
}

function buildBondRows(currency, categories, period) {
  const carryKey = period === "1m" ? "carry1m" : period === "6m" ? "carry6m" : "carry3m";
  const rollKey = period === "1m" ? "rolldown1m" : period === "6m" ? "rolldown6m" : "rolldown3m";
  const rows = [];

  categories.forEach((category, categoryIndex) => {
    for (let i = 1; i <= 5; i += 1) {
      const name = `${currency}-${category.slice(0, 4).toUpperCase()}-${i}`;
      const seed = hashCode(name + categoryIndex + period);
      rows.push({
        asset: name,
        yield: seeded(seed + 11, 2.1, 6.2),
        price: seeded(seed + 29, 94, 109),
        [carryKey]: seeded(seed + 37, -0.4, 1.2),
        [rollKey]: seeded(seed + 51, -0.6, 1.4),
        spd_pp: seeded(seed + 67, -40, 220),
        spd_yy: seeded(seed + 79, -35, 185),
        spd_z: seeded(seed + 97, -1.8, 3.8),
        spd_pp_xccy: seeded(seed + 109, -25, 140),
        spd_goc: seeded(seed + 131, -60, 160),
        spd_goc_rvs: seeded(seed + 149, -2.2, 2.4),
        spd_pp_rvs: seeded(seed + 167, -2.5, 2.1),
        spd_yy_rvs: seeded(seed + 181, -1.9, 2.7),
        yield_rvs: seeded(seed + 193, -1.3, 2.2),
      });
    }
  });

  return rows;
}

function buildBondHistory(asset, metric, range) {
  const seed = hashCode(`${asset}-${metric}-${range}`);
  const pointsByRange = { "1m": 12, "3m": 20, "6m": 28, ytd: 36, "1y": 48, "2y": 60, "5y": 72, "10y": 96, all: 120 };
  const points = pointsByRange[range] || 36;
  const baseline = metric === "price" ? 98 : metric.includes("spd") ? 40 : 3.5;
  const amplitude = metric === "price" ? 2.8 : metric.includes("spd") ? 14 : 1.8;
  const now = new Date("2026-04-10T00:00:00");
  const stepDays = range === "1m" ? 2 : range === "3m" ? 5 : range === "6m" ? 8 : range === "ytd" ? 10 : range === "1y" ? 14 : range === "2y" ? 20 : range === "5y" ? 35 : range === "10y" ? 60 : 75;

  return Array.from({ length: points }, (_, index) => {
    const t = index / 2.5;
    const value = baseline + Math.sin(t) * amplitude + Math.sin(t * 2.7) * (amplitude * 0.55) + Math.cos(t * 4.4) * (amplitude * 0.22) + (index % 9 === 0 ? amplitude * 0.95 : 0) + ((seed + index * 23) % 9) / 10;
    const date = new Date(now);
    date.setDate(now.getDate() - (points - 1 - index) * stepDays);
    return {
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      value: Number(value.toFixed(2)),
    };
  });
}

function BondChartPopup({ open, onClose, cell, isDark }) {
  const [range, setRange] = useState("1m");
  if (!open || !cell) return null;
  const history = buildBondHistory(cell.asset, cell.column, range);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1600, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(1100px, 96vw)", maxHeight: "90vh", overflow: "auto", borderRadius: 16, border: `1px solid ${isDark ? "#27272a" : "#e5e7eb"}`, background: isDark ? "#09090b" : "#ffffff", boxShadow: "0 20px 60px rgba(0,0,0,0.35)", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: isDark ? "#f4f4f5" : "#111827" }}>
            <span style={{ fontWeight: 600 }}>{cell.asset}</span>
            <span style={{ margin: "0 8px", color: isDark ? "#71717a" : "#9ca3af" }}>|</span>
            <span>{cell.column}</span>
          </div>
          <IconButton onClick={onClose} size="small" sx={{ color: isDark ? "#d4d4d8" : "#374151" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {TIME_RANGES.map((item) => (
            <button key={item} type="button" onClick={() => setRange(item)} style={{ borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", background: range === item ? "#f59e0b" : isDark ? "#18181b" : "#f3f4f6", color: range === item ? "#111827" : isDark ? "#d4d4d8" : "#374151", border: `1px solid ${range === item ? "#f59e0b" : isDark ? "#3f3f46" : "#d1d5db"}` }}>
              {item}
            </button>
          ))}
        </div>
        <div style={{ width: "100%", height: 420, borderRadius: 12, border: `1px solid ${isDark ? "#27272a" : "#e5e7eb"}`, background: isDark ? "rgba(24,24,27,0.6)" : "#f9fafb", padding: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid stroke={isDark ? "#27272a" : "#e5e7eb"} strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke={isDark ? "#a1a1aa" : "#6b7280"} tick={{ fontSize: 11, fill: isDark ? "#a1a1aa" : "#6b7280" }} />
              <YAxis stroke={isDark ? "#a1a1aa" : "#6b7280"} tick={{ fontSize: 11, fill: isDark ? "#a1a1aa" : "#6b7280" }} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? "#09090b" : "#ffffff", border: `1px solid ${isDark ? "#3f3f46" : "#d1d5db"}`, color: isDark ? "#f4f4f5" : "#111827", borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} />
              <Brush dataKey="date" height={24} travellerWidth={10} stroke="#f59e0b" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function BondSection({ view, onViewChange }) {
  const [currency, setCurrency] = useState("");
  const [categories, setCategories] = useState([]);
  const [period, setPeriod] = useState("1m");
  const [attribute, setAttribute] = useState("yield");
  const [date, setDate] = useState("2026-04-10");
  const [isDark, setIsDark] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortBy, setSortBy] = useState("asset");
  const [sortDirection, setSortDirection] = useState("asc");

  const categoryOptions = useMemo(() => (currency ? BOND_CATEGORY_BY_CURRENCY[currency] || [] : []), [currency]);

  const tableColumns = useMemo(() => {
    const carryKey = period === "1m" ? "carry1m" : period === "6m" ? "carry6m" : "carry3m";
    const rollKey = period === "1m" ? "rolldown1m" : period === "6m" ? "rolldown6m" : "rolldown3m";
    return BOND_COLUMNS.map((column) => {
      if (column === "carry3m") return carryKey;
      if (column === "rolldown3m") return rollKey;
      return column;
    });
  }, [period]);

  const curveSeries = useMemo(() => {
    if (!currency || !categories.length) return [];
    return categories.map((category) => ({ category, data: buildBondCurve(currency, category, attribute, period) }));
  }, [currency, categories, attribute, period]);

  const curveData = useMemo(() => mergeBondSeries(curveSeries), [curveSeries]);

  const rows = useMemo(() => {
    if (!currency || !categories.length) return [];
    return buildBondRows(currency, categories, period);
  }, [currency, categories, period]);

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const aNum = typeof aVal === "number" ? aVal : Number(aVal);
      const bNum = typeof bVal === "number" ? bVal : Number(bVal);
      const numeric = !Number.isNaN(aNum) && !Number.isNaN(bNum);
      const comparison = numeric ? aNum - bNum : String(aVal).localeCompare(String(bVal));
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return copy;
  }, [rows, sortBy, sortDirection]);

  const handleSort = (column) => {
    if (sortBy === column) setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const resetCurrency = (value) => {
    setCurrency(value);
    setCategories([]);
    setSelectedCell(null);
  };

  const text = isDark ? "#f4f4f5" : "#111827";
  const border = isDark ? "#27272a" : "#e5e7eb";
  const panel = isDark ? "#111827" : "#ffffff";
  const headerBg = isDark ? "#18181b" : "#f3f4f6";
  const rowEven = isDark ? "#111827" : "#ffffff";
  const rowOdd = isDark ? "#0f172a" : "#f8fafc";
  const muted = isDark ? "#a1a1aa" : "#6b7280";

  return (
    <div>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mb: 2 }}>
        <SingleSelect value={view} onChange={(e) => onViewChange(e.target.value)} options={TOP_OPTIONS} placeholder="Select" width={150} isDark={isDark} />
        <SingleSelect value={currency} onChange={(e) => resetCurrency(e.target.value)} options={CURRENCIES} placeholder="Currency" width={120} isDark={isDark} />
        {currency && <MultiSelect options={categoryOptions} value={categories} onChange={(e) => setCategories(e.target.value)} width={190} isDark={isDark} />}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
          <Switch
            checked={isDark}
            onChange={(e) => setIsDark(e.target.checked)}
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: isDark ? '#f59e0b' : '#2563eb' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: isDark ? '#f59e0b' : '#93c5fd' },
              '& .MuiSwitch-track': { backgroundColor: isDark ? '#3f3f46' : '#cbd5e1' },
            }}
          />
        </Box>
      </Box>

      {categories.length > 0 && (
        <div style={{ backgroundColor: panel, border: `1px solid ${border}`, borderRadius: 16, padding: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <SingleSelect value={attribute} onChange={(e) => setAttribute(e.target.value)} options={BOND_ATTRIBUTES} placeholder="Attribute" width={120} isDark={isDark} />
            <TextField type="date" value={date} onChange={(e) => setDate(e.target.value)} size="small" sx={getFieldSx(isDark, 130)} InputLabelProps={{ shrink: true }} />
          </div>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curveData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid stroke={isDark ? "#27272a" : "#e5e7eb"} strokeDasharray="3 3" />
                <XAxis dataKey="maturity" tickFormatter={(value) => value.replace("M", "m").replace("Y", "y")} stroke={muted} tick={{ fontSize: 11, fill: muted }} />
                <YAxis stroke={muted} tick={{ fontSize: 11, fill: muted }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? "#09090b" : "#ffffff", border: `1px solid ${border}`, color: text, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: text }} />
                {curveSeries.map((series, index) => (
                  <Line key={series.category} type="monotone" dataKey={series.category} stroke={CURVE_COLORS[index % CURVE_COLORS.length]} strokeWidth={2.2} dot={false} activeDot={{ r: 5 }} connectNulls />
                ))}
                <Brush dataKey="maturity" height={24} travellerWidth={10} stroke="#f59e0b" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            <SingleSelect value={period} onChange={(e) => setPeriod(e.target.value)} options={NAV_PERIODS} placeholder="Period" width={100} isDark={isDark} />
          </Box>
          <TableContainer style={{ backgroundColor: panel, border: `1px solid ${border}`, borderRadius: 16, maxHeight: 460, overflow: "auto" }}>
            <Table stickyHeader size="small" sx={{ minWidth: 1400, tableLayout: "auto" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ position: "sticky", left: 0, zIndex: 3, backgroundColor: headerBg, color: text, minWidth: 90, width: 90, borderBottom: `1px solid ${border}` }}>
                    <TableSortLabel active={sortBy === "asset"} direction={sortBy === "asset" ? sortDirection : "asc"} onClick={() => handleSort("asset")} sx={{ color: `${text} !important`, '& .MuiTableSortLabel-icon': { color: `${muted} !important` } }}>asset</TableSortLabel>
                  </TableCell>
                  {tableColumns.map((column) => (
                    <TableCell key={column} align="right" sx={{ backgroundColor: headerBg, color: text, minWidth: 92, width: 92, borderBottom: `1px solid ${border}` }}>
                      <TableSortLabel active={sortBy === column} direction={sortBy === column ? sortDirection : "asc"} onClick={() => handleSort(column)} sx={{ color: `${text} !important`, '& .MuiTableSortLabel-icon': { color: `${muted} !important` } }}>{column}</TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRows.map((row, rowIndex) => {
                  const rowSelected = selectedRow === row.asset;
                  return (
                    <TableRow key={row.asset} hover onClick={() => setSelectedRow(row.asset)} sx={{ backgroundColor: rowSelected ? "rgba(245,158,11,0.10)" : rowIndex % 2 === 0 ? rowEven : rowOdd, '& td': { borderBottom: `1px solid ${border}` } }}>
                      <TableCell sx={{ position: "sticky", left: 0, zIndex: 2, backgroundColor: rowSelected ? "rgba(245,158,11,0.10)" : rowIndex % 2 === 0 ? rowEven : rowOdd, color: text, minWidth: 70, width: 70, py: 0.5 }}>{row.asset}</TableCell>
                      {tableColumns.map((column) => {
                        const selected = selectedCell?.asset === row.asset && selectedCell?.column === column;
                        return (
                          <TableCell key={column} align="right" sx={{ py: 0.5 }}>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedRow(row.asset); setSelectedCell({ asset: row.asset, column, value: row[column] }); }} style={{ borderRadius: 4, padding: "1px 5px", fontSize: 10.5, fontWeight: 500, border: `1px solid ${selected ? "#fb923c" : "#f59e0b"}`, backgroundColor: selected ? "rgba(251,146,60,0.22)" : "rgba(245,158,11,0.10)", color: "#f59e0b", minWidth: 42, cursor: "pointer" }}>
                              {row[column]}
                            </button>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <BondChartPopup open={Boolean(selectedCell)} onClose={() => setSelectedCell(null)} cell={selectedCell} isDark={isDark} />
    </div>
  );
}

function buildSwapMetricsRow(currency, structure) {
  if (!currency || !structure) return null;
  const seed = hashCode(`${currency}-${structure}`);
  return {
    crr: currency,
    str: structure,
    chg: seeded(seed + 11, -12, 12),
    zscore: seeded(seed + 17, -3.5, 3.5),
    stdev_d: seeded(seed + 29, 0.2, 4.2),
    "chg/stdev": seeded(seed + 31, -2.8, 2.8),
    "MR Ret": seeded(seed + 43, -18, 18),
    "Exp Ret": seeded(seed + 59, -12, 16),
    "Mr Freq": seeded(seed + 61, 0, 100),
    "1 std MR Freq": seeded(seed + 73, 0, 100),
    "ADF stat": seeded(seed + 79, -5, 0),
    "Hurst Stat": seeded(seed + 83, 0, 1),
    RSI: seeded(seed + 97, 10, 90),
  };
}

function buildSwapSpreadSeries(cell) {
  const seed = hashCode(`${cell.rowId}-${cell.column}-spread`);
  const points = 28;
  const start = new Date("2026-04-10T00:00:00");
  return Array.from({ length: points }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() - (points - 1 - index) * 4);
    const t = index / 2.3;
    const base = Number(cell.value) || 0;
    return {
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      value: Number((base + Math.sin(t + (seed % 5)) * 5 + Math.sin(t * 2.8) * 2.2 + (index % 10 === 0 ? 3.5 : 0) + ((seed + index * 23) % 9) / 7).toFixed(2)),
    };
  });
}

function buildSwapRegressionBundle(cell) {
  const seed = hashCode(`${cell.rowId}-${cell.column}-reg`);
  const points = 28;
  const x0 = 2.9 + (seed % 10) / 100;
  const slope = 0.72 + (seed % 7) / 50;
  const intercept = 1.18 + (seed % 9) / 40;
  const scatter = Array.from({ length: points }, (_, index) => {
    const x = x0 + index * 0.015 + ((seed + index * 11) % 5) / 300;
    const fitted = intercept + slope * x;
    const noise = Math.sin(index / 2.7 + (seed % 3)) * 0.025 + ((seed + index * 17) % 7) / 500;
    return { x: Number(x.toFixed(3)), y: Number((fitted + noise).toFixed(3)), fitted: Number(fitted.toFixed(3)) };
  });
  return { scatter, last: scatter[scatter.length - 1] };
}

function RegressionSvgChart({ bundles }) {
  const width = 1100;
  const height = 460;
  const margin = { top: 24, right: 24, bottom: 40, left: 56 };
  const allX = bundles.flatMap((b) => b.scatter.map((p) => p.x));
  const allY = bundles.flatMap((b) => b.scatter.flatMap((p) => [p.y, p.fitted]));
  const xMin = Math.min(...allX);
  const xMax = Math.max(...allX);
  const yMin = Math.min(...allY);
  const yMax = Math.max(...allY);
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const sx = (x) => margin.left + ((x - xMin) / ((xMax - xMin) || 1)) * plotW;
  const sy = (y) => margin.top + plotH - ((y - yMin) / ((yMax - yMin) || 1)) * plotH;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none">
      <rect x="0" y="0" width={width} height={height} fill="#3b352e" />
      {Array.from({ length: 7 }, (_, i) => {
        const y = margin.top + (plotH / 6) * i;
        const value = yMax - ((yMax - yMin) / 6) * i;
        return (
          <g key={`y-${i}`}>
            <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#64748b" strokeWidth="1" />
            <text x={margin.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#e5e7eb">{value.toFixed(2)}</text>
          </g>
        );
      })}
      {Array.from({ length: 7 }, (_, i) => {
        const x = margin.left + (plotW / 6) * i;
        const value = xMin + ((xMax - xMin) / 6) * i;
        return (
          <g key={`x-${i}`}>
            <line x1={x} y1={margin.top} x2={x} y2={height - margin.bottom} stroke="#64748b" strokeWidth="1" />
            <text x={x} y={height - 14} textAnchor="middle" fontSize="11" fill="#e5e7eb">{value.toFixed(2)}</text>
          </g>
        );
      })}
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#e5e7eb" strokeWidth="1.5" />
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#e5e7eb" strokeWidth="1.5" />
      {bundles.map((bundle, index) => {
        const color = SERIES_COLORS[index % SERIES_COLORS.length];
        const first = bundle.scatter[0];
        const last = bundle.scatter[bundle.scatter.length - 1];
        return (
          <g key={bundle.label}>
            <line x1={sx(first.x)} y1={sy(first.fitted)} x2={sx(last.x)} y2={sy(last.fitted)} stroke="#67e8f9" strokeWidth="3" />
            {bundle.scatter.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill={color} />)}
            <circle cx={sx(bundle.last.x)} cy={sy(bundle.last.y)} r={5} fill="#f97316" />
          </g>
        );
      })}
      <text x={width / 2} y={height - 4} textAnchor="middle" fontSize="12" fill="#e5e7eb">10y</text>
    </svg>
  );
}

function SwapChartPopup({ open, onClose, selections, rowMap, chartType }) {
  if (!open || selections.length === 0) return null;

  const spreadData = (() => {
    const baseSeries = buildSwapSpreadSeries(selections[0]);
    return baseSeries.map((point, index) => {
      const row = { date: point.date };
      const picked = [];
      selections.forEach((sel) => {
        const series = buildSwapSpreadSeries(sel);
        const label = `${rowMap[sel.rowId]?.str || sel.rowId} | ${sel.column}`;
        const value = series[index]?.value;
        row[label] = value;
        picked.push({ label, value });
      });
      if (selections.length === 2) {
        const diffLabel = `${picked[1].label} - ${picked[0].label}`;
        row[diffLabel] = Number(((picked[1].value ?? 0) - (picked[0].value ?? 0)).toFixed(2));
      }
      return row;
    });
  })();

  const regressionBundles = selections.map((sel) => ({ label: `${rowMap[sel.rowId]?.str || sel.rowId} | ${sel.column}`, ...buildSwapRegressionBundle(sel) }));

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1600, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(1200px, 96vw)", maxHeight: "90vh", overflow: "auto", borderRadius: 16, border: "1px solid #27272a", background: "#2f2a23", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#f4f4f5", fontWeight: 600 }}>{chartType}</div>
          <IconButton onClick={onClose} size="small" sx={{ color: "#d4d4d8" }}><CloseIcon fontSize="small" /></IconButton>
        </div>
        <div style={{ width: "100%", height: 460, borderRadius: 12, border: "1px solid #94a3b8", background: "#3b352e", padding: 12 }}>
          {chartType === "Regression Chart" ? (
            <RegressionSvgChart bundles={regressionBundles} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spreadData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#a1a1aa" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                <YAxis stroke="#a1a1aa" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#f4f4f5" }} />
                {selections.map((sel, index) => {
                  const label = `${rowMap[sel.rowId]?.str || sel.rowId} | ${sel.column}`;
                  return <Line key={label} type="monotone" dataKey={label} name={label} stroke={SERIES_COLORS[index % SERIES_COLORS.length]} strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />;
                })}
                {selections.length === 2 && (() => {
                  const label1 = `${rowMap[selections[0].rowId]?.str || selections[0].rowId} | ${selections[0].column}`;
                  const label2 = `${rowMap[selections[1].rowId]?.str || selections[1].rowId} | ${selections[1].column}`;
                  const diffLabel = `${label2} - ${label1}`;
                  return <Line key={diffLabel} type="monotone" dataKey={diffLabel} name={diffLabel} stroke="#ffffff" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />;
                })()}
                <Brush dataKey="date" height={24} travellerWidth={10} stroke="#f59e0b" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function createSwapRow(id) {
  return { id, crr: "", str: "", metrics: null };
}

function SwapSection({ view, onViewChange }) {
  const [rows, setRows] = useState(Array.from({ length: 10 }, (_, i) => createSwapRow(`row-${i + 1}`)));
  const [selectedCells, setSelectedCells] = useState([]);
  const [chartOpen, setChartOpen] = useState(false);
  const [chartType, setChartType] = useState("Spread Chart");
  const [menuState, setMenuState] = useState(null);

  const rowMap = useMemo(() => {
    const map = {};
    rows.forEach((row) => {
      if (row.metrics) map[row.id] = row.metrics;
    });
    return map;
  }, [rows]);

  const updateRow = (rowId, patch) => {
    setRows((prev) => prev.map((row) => {
      if (row.id !== rowId) return row;
      const next = { ...row, ...patch };
      next.metrics = next.crr && next.str ? buildSwapMetricsRow(next.crr, next.str) : null;
      return next;
    }));
  };

  const openSingleSpread = (row, column) => {
    const value = row.metrics?.[column];
    setSelectedCells([{ key: `${row.id}::${column}`, rowId: row.id, column, value }]);
    setChartType("Spread Chart");
    setChartOpen(true);
  };

  const toggleCell = (row, column) => {
    const key = `${row.id}::${column}`;
    const value = row.metrics?.[column];
    setSelectedCells((prev) => prev.some((item) => item.key === key) ? prev.filter((item) => item.key !== key) : [...prev, { key, rowId: row.id, column, value }]);
  };

  const handleContextMenu = (event, row, column) => {
    event.preventDefault();
    const key = `${row.id}::${column}`;
    const value = row.metrics?.[column];
    setSelectedCells((prev) => prev.some((item) => item.key === key) ? prev : [...prev, { key, rowId: row.id, column, value }]);
    setMenuState({ mouseX: event.clientX + 2, mouseY: event.clientY - 6 });
  };

  const openChart = (type) => {
    setChartType(type);
    setChartOpen(true);
    setMenuState(null);
  };

  return (
    <div>
      <Box sx={{ display: "flex", mb: 2 }}>
        <SingleSelect value={view} onChange={(e) => onViewChange(e.target.value)} options={TOP_OPTIONS} placeholder="Select" width={150} isDark />
      </Box>

      <TableContainer style={{ backgroundColor: "#111827", border: "1px solid #27272a", borderRadius: 16, maxHeight: 560, overflow: "auto" }}>
        <Table stickyHeader size="small" sx={{ minWidth: 1450, tableLayout: "fixed" }}>
          <TableHead>
            <TableRow>
              {SWAP_COLUMNS.map((column) => (
                <TableCell key={column} sx={{ backgroundColor: "#18181b", color: "#f4f4f5", fontSize: 11, fontWeight: 600, minWidth: column === "str" ? 240 : column === "crr" ? 130 : 100, width: column === "str" ? 240 : column === "crr" ? 130 : 100, borderBottom: "1px solid #27272a" }} align={column === "str" || column === "crr" ? "left" : "right"}>
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => {
              const structureOptions = SWAP_STRUCTURES_BY_CURRENCY[row.crr] || [];
              const stripe = rowIndex % 2 === 0 ? "#111827" : "#0f172a";
              return (
                <TableRow key={row.id} sx={{ backgroundColor: stripe, '& td': { borderBottom: '1px solid #27272a' } }}>
                  <TableCell sx={{ minWidth: 130, width: 130 }}>
                    <SingleSelect value={row.crr} onChange={(e) => { updateRow(row.id, { crr: e.target.value, str: "" }); setSelectedCells((prev) => prev.filter((item) => item.rowId !== row.id)); }} options={CURRENCIES} placeholder="Currency" width={110} isDark />
                  </TableCell>
                  <TableCell sx={{ minWidth: 240, width: 240 }}>
                    <Autocomplete
                      freeSolo
                      options={structureOptions}
                      value={row.str}
                      onInputChange={(_, value) => updateRow(row.id, { str: value || "" })}
                      onChange={(_, value) => updateRow(row.id, { str: value || "" })}
                      sx={{
                        width: 220,
                        "& .MuiOutlinedInput-root": { height: 30, fontSize: 12, color: "#f4f4f5", backgroundColor: "#18181b", borderRadius: 2 },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#3f3f46" },
                        "& input": { color: "#f4f4f5", padding: "4px 8px" },
                      }}
                      renderInput={(params) => <TextField {...params} placeholder="Type structure" size="small" />}
                    />
                  </TableCell>
                  {SWAP_VALUE_COLUMNS.map((column) => {
                    const selected = selectedCells.some((item) => item.key === `${row.id}::${column}`);
                    return (
                      <TableCell key={column} align="right" sx={{ color: "#f4f4f5", fontSize: 12, minWidth: 100, width: 100 }}>
                        {row.metrics ? (
                          <button
                            type="button"
                            onClick={() => openSingleSpread(row, column)}
                            onContextMenu={(e) => handleContextMenu(e, row, column)}
                            style={{
                              borderRadius: 4,
                              padding: "1px 5px",
                              fontSize: 10.5,
                              fontWeight: 500,
                              border: `1px solid ${selected ? "#fb923c" : "#f59e0b"}`,
                              backgroundColor: selected ? "rgba(251,146,60,0.22)" : "rgba(245,158,11,0.10)",
                              color: "#f59e0b",
                              minWidth: 42,
                              cursor: "pointer",
                            }}
                          >
                            {row.metrics[column]}
                          </button>
                        ) : ""}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu open={Boolean(menuState)} onClose={() => setMenuState(null)} anchorReference="anchorPosition" anchorPosition={menuState ? { top: menuState.mouseY, left: menuState.mouseX } : undefined} PaperProps={{ sx: { bgcolor: "#09090b", color: "#f4f4f5", border: "1px solid #27272a" } }}>
        <MenuItem onClick={() => openChart("Spread Chart")}>Spread Chart</MenuItem>
        <MenuItem onClick={() => openChart("Regression Chart")}>Regression Chart</MenuItem>
      </Menu>

      <SwapChartPopup open={chartOpen} onClose={() => setChartOpen(false)} selections={selectedCells} rowMap={rowMap} chartType={chartType} />
    </div>
  );
}

export default function RatesParentMockup() {
  const [view, setView] = useState("");

  return (
    <div style={{ minHeight: "100vh", padding: 16, backgroundColor: "#09090b", color: "#f4f4f5" }}>
      {view === "bonds" ? (
        <BondSection view={view} onViewChange={setView} />
      ) : view === "swap rates" ? (
        <SwapSection view={view} onViewChange={setView} />
      ) : (
        <Box sx={{ display: "flex" }}>
          <SingleSelect value={view} onChange={(e) => setView(e.target.value)} options={TOP_OPTIONS} placeholder="Select" width={150} isDark />
        </Box>
      )}
    </div>
  );
}
