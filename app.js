import { AppViewModel } from './viewmodels/AppViewModel.js?v=3.0';
import { SceneView } from './views/SceneView.js?v=3.0';
import { UIView } from './views/UIView.js?v=3.0';

async function main() {
  console.log('Đang khởi tạo ứng dụng...');
  
  // 1. Create AppViewModel
  const appVM = new AppViewModel();
  
  // 2. Load all data
  await appVM.initialize();
  
  // 3. Create Views
  const container = document.getElementById('three-container');
  if (!container) {
    throw new Error('Không tìm thấy #three-container trong DOM');
  }
  
  const sceneView = new SceneView(container, appVM.sceneVM, appVM);
  const uiView = new UIView(appVM.movementVM, appVM.sceneVM, appVM);
  
  // 4. Initialize 3D scene
  await sceneView.init();
  
  // 5. Setup initial UI state & URL parameters
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }

  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode');
  const chainParam = urlParams.get('chain');
  const movementParam = urlParams.get('movement');

  if (modeParam === 'acupuncture' || chainParam) {
    appVM.setMode('acupuncture');
    const tabAcu = document.getElementById('tab-mode-acupuncture');
    if (tabAcu) tabAcu.click();

    if (chainParam && appVM.acupunctureVM) {
      appVM.acupunctureVM.selectChain(chainParam);
      const selChain = document.getElementById('chain-select');
      if (selChain) selChain.value = chainParam;
    }
  } else if (movementParam && appVM.movementVM) {
    appVM.movementVM.selectMovement(movementParam);
    const sel = document.getElementById('movement-select');
    if (sel) sel.value = movementParam;
  }

  console.log('✅ Ứng dụng 3D Hệ Cơ & Châm Cứu đã sẵn sàng!');
}

document.addEventListener('DOMContentLoaded', () => {
  main().catch(err => {
    console.error('Lỗi khởi tạo ứng dụng:', err);
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      const p = overlay.querySelector('p');
      if (p) p.textContent = `Lỗi: ${err.message}`;
      const spinner = overlay.querySelector('.spinner');
      if (spinner) spinner.style.display = 'none';
    } else {
      alert(`Lỗi khởi tạo ứng dụng: ${err.message}`);
    }
  });
});
