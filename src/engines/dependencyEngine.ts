import * as fs from 'fs';
import * as path from 'path';

export class DependencyEngine {
  public calculateIncomingImports(baseDir: string, moduleName: string): number {
    let count = 0;

    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const list = fs.readdirSync(dir);
      
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !file.includes('node_modules')) {
          walk(fullPath);
        } else if (stat.isFile() && /\.(ts|js)$/.test(file)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(`/${moduleName}`) || content.includes(`@modules/${moduleName}`)) {
            count++;
          }
        }
      }
    };

    walk(baseDir);
    return count;
  }
}
