import JSZip from 'jszip';
import { PYTHON_PROJECT_FILES } from './pythonSourceRegistry';

export async function downloadPythonProjectZip(): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('MediStock') || zip;

  // Add registered files
  PYTHON_PROJECT_FILES.forEach(file => {
    folder.file(file.path, file.content);
  });

  // Add run scripts
  folder.file('run_project.bat', `@echo off
echo Starting MediStock Python Mini Project...
call venv\\Scripts\\activate.bat
python app.py
pause
`);

  folder.file('run_project.ps1', `Write-Host "Starting MediStock Flask Web App..." -ForegroundColor Green
& .\\venv\\Scripts\\Activate.ps1
python app.py
`);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'MediStock-Python-MCA-Mini-Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
