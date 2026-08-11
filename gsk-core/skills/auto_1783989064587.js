const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function execute(input) {
  const skillName = 'auto_1783989057597';
  const skillPath = path.join(__dirname, skillName + '.js');

  // Create the skill file if it doesn't exist
  if (!fs.existsSync(skillPath)) {
    fs.writeFileSync(skillPath, '');
  }

  // Append the input to the skill file
  fs.appendFileSync(skillPath, input + '\n');

  // Execute the skill file
  return new Promise((resolve, reject) => {
    exec(`node ${skillPath}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing skill: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Skill error: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

module.exports = { execute };
