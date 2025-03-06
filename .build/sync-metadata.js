import fs from 'fs/promises';
import TOML from '@iarna/toml';
import { deepEqual } from 'assert';

async function main() {
  // Read metadata.json
  const metadata = JSON.parse(await fs.readFile('metadata.json', 'utf8'));

  // Update package.json
  const packageJsonPath = 'package.json';
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  const newPackageJson = { ...packageJson };
  newPackageJson.name = metadata.name.toLowerCase();
  newPackageJson.version = metadata.version;
  
  // Only write if changes were made
  if (!isEqual(packageJson, newPackageJson)) {
    await fs.writeFile(packageJsonPath, JSON.stringify(newPackageJson, null, 2));
    console.log('Updated package.json');
  } else {
    console.log('No changes needed for package.json');
  }

  // Update src-tauri/capabilities/default.json
  const capabilitiesPath = 'src-tauri/capabilities/default.json';
  const capabilities = JSON.parse(await fs.readFile(capabilitiesPath, 'utf8'));
  const newCapabilities = JSON.parse(JSON.stringify(capabilities)); // Deep clone
  
  let capabilitiesChanged = false;
  newCapabilities.permissions.forEach((permission, index) => {
    if (permission.identifier === 'shell:allow-spawn') {
      const newName = `../dist-back/${metadata.backend_identifier}`;
      if (permission.allow[0].name !== newName) {
        permission.allow[0].name = newName;
        capabilitiesChanged = true;
      }
    }
  });
  
  if (capabilitiesChanged) {
    await fs.writeFile(capabilitiesPath, JSON.stringify(newCapabilities, null, 2));
    console.log('Updated capabilities config');
  } else {
    console.log('No changes needed for capabilities config');
  }

  // Update src-tauri/Cargo.toml - Read only once
  const cargoPath = 'src-tauri/Cargo.toml';
  const cargoContent = await fs.readFile(cargoPath, 'utf8');
  // Parse the original content
  const cargoToml = TOML.parse(cargoContent);
  
  // First check if any changes are needed at all
  const cargoNeedsChanges = 
    cargoToml.package.name !== metadata.name.toLowerCase() ||
    cargoToml.package.version !== metadata.version ||
    cargoToml.package.description !== metadata.description ||
    !arraysEqual(cargoToml.package.authors, metadata.authors);
  
  // Only perform modifications if changes are needed
  if (cargoNeedsChanges) {
    console.log('Changes needed for Cargo.toml');
    
    // Make a modified version of the TOML object
    const newCargoToml = JSON.parse(JSON.stringify(cargoToml));
    newCargoToml.package.name = metadata.name.toLowerCase();
    newCargoToml.package.version = metadata.version;
    newCargoToml.package.description = metadata.description;
    newCargoToml.package.authors = metadata.authors;
    
    // Convert to string for writing
    const newCargoContent = TOML.stringify(newCargoToml);
    
    // CRITICAL: Only write if the content is actually different
    if (cargoContent !== newCargoContent) {
      await fs.writeFile(cargoPath, newCargoContent);
      console.log('Updated Cargo.toml');
    } else {
      console.log('Cargo.toml content unchanged after serialization, skipping write');
    }
  } else {
    console.log('No changes needed for Cargo.toml');
  }

  // Update pyproject.toml - Similar approach to Cargo.toml
  const pyprojectPath = 'pyproject.toml';
  const pyprojectContent = await fs.readFile(pyprojectPath, 'utf8');
  const pyprojectToml = TOML.parse(pyprojectContent);
  
  // Check if changes are needed
  const pyprojectNeedsChanges = 
    pyprojectToml.tool.poetry.name !== metadata.name ||
    pyprojectToml.tool.poetry.version !== metadata.version ||
    pyprojectToml.tool.poetry.description !== metadata.description ||
    !arraysEqual(pyprojectToml.tool.poetry.authors, metadata.authors);
  
  if (pyprojectNeedsChanges) {
    console.log('Changes needed for pyproject.toml');
    
    // Create a modified version
    const newPyprojectToml = JSON.parse(JSON.stringify(pyprojectToml));
    newPyprojectToml.tool.poetry.name = metadata.name;
    newPyprojectToml.tool.poetry.version = metadata.version;
    newPyprojectToml.tool.poetry.description = metadata.description;
    newPyprojectToml.tool.poetry.authors = metadata.authors;
    
    // Convert to string
    const newPyprojectContent = TOML.stringify(newPyprojectToml);
    
    // Only write if different
    if (pyprojectContent !== newPyprojectContent) {
      await fs.writeFile(pyprojectPath, newPyprojectContent);
      console.log('Updated pyproject.toml');
    } else {
      console.log('pyproject.toml content unchanged after serialization, skipping write');
    }
  } else {
    console.log('No changes needed for pyproject.toml');
  }

  // Update src-tauri/tauri.conf.json
  const tauriConfigPath = 'src-tauri/tauri.conf.json';
  const tauriConfigContent = await fs.readFile(tauriConfigPath, 'utf8');
  const tauriConfig = JSON.parse(tauriConfigContent);
  
  // Check individual fields for changes
  let tauriConfigChanged = false;
  
  if (tauriConfig.productName !== metadata.name) {
    tauriConfig.productName = metadata.name;
    tauriConfigChanged = true;
  }
  
  if (tauriConfig.identifier !== metadata.bundle_identifier) {
    tauriConfig.identifier = metadata.bundle_identifier;
    tauriConfigChanged = true;
  }
  
  if (tauriConfig.version !== metadata.version) {
    tauriConfig.version = metadata.version;
    tauriConfigChanged = true;
  }
  
  const expectedBin = `../dist-back/${metadata.backend_identifier}`;
  if (!tauriConfig.bundle.externalBin || 
      tauriConfig.bundle.externalBin.length !== 1 || 
      tauriConfig.bundle.externalBin[0] !== expectedBin) {
    tauriConfig.bundle.externalBin = [expectedBin];
    tauriConfigChanged = true;
  }
  
  if (tauriConfig.app.windows[0].title !== metadata.name) {
    tauriConfig.app.windows[0].title = metadata.name;
    tauriConfigChanged = true;
  }
  
  if (tauriConfigChanged) {
    // Convert to string with same formatting as original
    const newTauriConfigContent = JSON.stringify(tauriConfig, null, 2);
    
    // Only write if different
    if (tauriConfigContent !== newTauriConfigContent) {
      await fs.writeFile(tauriConfigPath, newTauriConfigContent);
      console.log('Updated tauri.conf.json');
    } else {
      console.log('tauri.conf.json content unchanged after serialization, skipping write');
    }
  } else {
    console.log('No changes needed for tauri.conf.json');
  }
}

// Deep equality check that works with nested objects and arrays
function isEqual(obj1, obj2) {
  try {
    deepEqual(obj1, obj2);
    return true;
  } catch (e) {
    return false;
  }
}

// Simple array equality check
function arraysEqual(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length) {
    return false;
  }
  
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  
  return true;
}

main()
  .then(() => {
    console.log('Metadata sync completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error syncing metadata:', error);
    process.exit(1);
  });