const exec = require('child_process').exec;

exec('cd D:\\myhotel\\backend && node index.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error starting backend: ${error}`);
    return;
  }
  console.log(`Backend started: ${stdout}`);
});

exec('cd D:\\myhotel\\frontend && npm run dev', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error starting frontend: ${error}`);
    return;
  }
  console.log(`Frontend started: ${stdout}`);
});
