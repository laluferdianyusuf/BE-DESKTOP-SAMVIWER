const generateLogTable = (logs) => {
  if (logs.length === 0) {
    return "<p>Tidak ada data log untuk kemarin.</p>";
  }

  const rows = logs
    .map(
      (log) => `
    <tr>
      <td>${new Date(log.createdAt).toLocaleString()}</td>
      <td>${log.samId || "-"}</td>
      <td>${log.speed || "-"}</td>
      <td><a href="${encodeURI(
        log.video
      )}" target="_blank" rel="noopener noreferrer">Link Video</a></td>
    </tr>
  `
    )
    .join("");

  return `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-family: Arial; font-size: 14px;">
      <thead style="background: #f2f2f2;">
        <tr>
          <th>Log Time</th>
          <th>Device</th>
          <th>Speed</th>
          <th>Video URL</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

module.exports = { generateLogTable };
