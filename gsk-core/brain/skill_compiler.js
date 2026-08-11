/**
 * MEMORY→SKILL COMPILATION — Big Dog II
 * Repeated patterns in memory auto-compile into new skills.
 */

const fs = require('fs');
const path = require('path');
const { validatePath } = require('../utils.js');

class SkillCompiler {
  constructor(config = {}) {
    this.skillsDir = config.skillsDir || path.join(__dirname, '../../gsk-core/skills');
    this.thinkCallback = config.thinkCallback || null;
    this.memoryQuery = config.memoryQuery || null;
    this.intervalMinutes = config.intervalMinutes || 60;
    this.intervalId = null;
  }

  start() {
    if (this.intervalId) return;
    console.log(`[SkillCompiler] Starting — checks every ${this.intervalMinutes}min`);
    setTimeout(() => this._compile(), 120000);
    this.intervalId = setInterval(() => this._compile(), this.intervalMinutes * 60 * 1000);
  }

  stop() {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }

  async _compile() {
    if (!this.memoryQuery || !this.thinkCallback) return;

    try {
      const recent = await this.memoryQuery({ limit: 50, type: 'curiosity' });
      if (!recent || recent.length < 3) return;

      const topics = [];
      for (const m of recent) {
        const content = m.content || '';
        const matches = content.match(/Explored "([^"]+)"/);
        if (matches) topics.push(matches[1]);
      }

      if (topics.length < 2) return;

      const prompt = `You are GSK, building a skill from what you've learned.\n\nTopics explored recently:\n${topics.map(t => `- ${t}`).join('\n')}\n\nCreate a Node.js skill module at ${this.skillsDir}/auto_${Date.now()}.js that encapsulates what you learned. Return ONLY the JavaScript code, no explanation, no tool-call JSON, no markdown fences. The module should export a function named 'execute' that takes an input param and returns a string.`;

      const code = await this.thinkCallback(prompt);
      if (!code) return;

      const filename = `auto_${Date.now()}.js`;
      const filepath = path.join(this.skillsDir, filename);

      let cleanCode = code.trim();

      // Handle JSON tool-call format (the LLM may emit {"tool":"write_file","path":"...","content":"..."})
      const toolCallMatch = cleanCode.match(/^{"tool":\s*"write_file".*}$/s);
      if (toolCallMatch) {
        try {
          const parsed = JSON.parse(cleanCode);
          if (parsed.content) {
            cleanCode = parsed.content;
          } else {
            console.log('[SkillCompiler] Rejecting tool-call JSON without content field');
            return;
          }
        } catch (e) {
          console.log('[SkillCompiler] Could not parse tool-call JSON, treating as code');
        }
      }

      // Extract code from markdown fences
      const codeMatch = cleanCode.match(/```(?:javascript|js)?\n([\s\S]*?)```/);
      if (codeMatch) cleanCode = codeMatch[1];

      // Validate that we have actual JS code (not just a path or empty)
      if (!cleanCode || cleanCode.length < 20 || !cleanCode.includes('execute')) {
        console.log('[SkillCompiler] Rejecting non-JS content in skill file');
        return;
      }

      // Normalize any hallucinated paths inside the code
      cleanCode = cleanCode.replace(/C:\\Users\\(?:Craig|craig|craigh)\\/gi, `C:\\Users\\${path.basename(require('os').homedir())}\\`);
      cleanCode = cleanCode.replace(/C:\\GSK\\/gi, process.env.GSK_ROOT || path.join(__dirname, '..'));

      fs.writeFileSync(filepath, cleanCode);
      console.log(`[SkillCompiler] Created skill: ${filename}`);
    } catch (e) {
      console.log(`[SkillCompiler] Error: ${e.message}`);
    }
  }
}

module.exports = { SkillCompiler };
