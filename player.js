// player.js
class Player {
    constructor() {
      // Base stats
      this.hp = 100;
      this.baseAttack = 1;
      this.baseArmor = 0;
      this.baseChanceToHit = 70;
      this.baseChanceToCrit = 1;
      // Current stats (start as base)
      this.attack = this.baseAttack;
      this.armor = this.baseArmor;
      this.chanceToHit = this.baseChanceToHit;
      this.chanceToCrit = this.baseChanceToCrit;
      // Equipment slots – added legs slot
      this.equipment = {
        mainHand: null,
        offHand: null,
        legs: null
      };
    }
  
    recalcStats() {
      // Start with base values.
      this.attack = this.baseAttack;
      this.armor = this.baseArmor;
      // Sum bonuses from equipped items (if any).
      if (this.equipment.mainHand) {
        this.attack += Number(this.equipment.mainHand.attackPower) || 0;
        this.armor += Number(this.equipment.mainHand.armor) || 0;
      }
      if (this.equipment.offHand) {
        this.attack += Number(this.equipment.offHand.attackPower) || 0;
        this.armor += Number(this.equipment.offHand.armor) || 0;
      }
      // Add legs equipment stats
      if (this.equipment.legs) {
        this.attack += Number(this.equipment.legs.attackPower) || 0;
        this.armor += Number(this.equipment.legs.armor) || 0;
      }
      // (Chance to hit and crit could also be modified here if needed.)
    }
  
    equipItem(slot, item) {
      this.equipment[slot] = item;
      this.recalcStats();
    }
  
    unequipItem(slot) {
      this.equipment[slot] = null;
      this.recalcStats();
    }
  }
  
  // Updates the UI elements (assumed to have the following IDs in your HTML)
  function updatePlayerStatsUI() {
    const attackEl = document.getElementById("stat-attack-power");
    const armorEl = document.getElementById("stat-armor");
    const hitEl = document.getElementById("stat-chance-to-hit");
    const critEl = document.getElementById("stat-chance-to-crit");
    if (attackEl) attackEl.textContent = player.attack;
    if (armorEl) armorEl.textContent = player.armor;
    if (hitEl) hitEl.textContent = player.chanceToHit + "%";
    if (critEl) critEl.textContent = player.chanceToCrit + "%";
  }
  
  export const player = new Player();
  export { updatePlayerStatsUI };