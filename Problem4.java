import java.util.*;

public class Problem4 {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter number of years: ");
        int n = sc.nextInt();
        int[] prices = new int[n];
        System.out.print("Enter prices for each year: ");
        for (int i = 0; i < n; i++) {
            prices[i] = sc.nextInt();
        }

        int minLoss = Integer.MAX_VALUE;
        int buyYear = -1;
        int sellYear = -1;

        for (int i = 0; i < n - 1; i++) {
            for (int j = i + 1; j < n; j++) {
                int loss = prices[i] - prices[j];
                if (loss > 0 && loss < minLoss) {
                    minLoss = loss;
                    buyYear = i + 1;
                    sellYear = j + 1;
                }
            }
        }

        if (minLoss == Integer.MAX_VALUE) {
            System.out.println("No valid loss found (cannot sell at a loss).");
        } else {
            System.out.println("Buy in year: " + buyYear);
            System.out.println("Sell in year: " + sellYear);
            System.out.println("Minimum Loss: " + minLoss);
        }
    }
}
