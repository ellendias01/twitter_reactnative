// services/ABTestingService.ts

class ABTestingService {
  private currentVariant: 'A' | 'B' = 'A';

  getUserVariant(): 'A' | 'B' {
    return this.currentVariant;
  }

  setUserVariant(variant: 'A' | 'B') {
    this.currentVariant = variant;
  }

  resetTest() {
    // Lógica para resetar o teste A/B
    this.currentVariant = Math.random() > 0.5 ? 'B' : 'A';
  }
}

export default new ABTestingService();