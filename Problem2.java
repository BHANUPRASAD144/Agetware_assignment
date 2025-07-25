import java.util.Scanner;

public class Problem2 {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter the number: ");
        double number = scanner.nextDouble();
        System.out.println("Indian Number Format: " + formatNumberInIndianStyle(number));
    }
    public static String formatNumberInIndianStyle(double number) {
        int num= (int) number;
        String numStr = String.valueOf(num);
        StringBuilder formatted = new StringBuilder();
        boolean bool=true;
        int count = 0;
        for(int i=numStr.length()-1; i>=0; i--) {
            formatted.append(numStr.charAt(i));
            count++;
            if(bool && count==3){
                formatted.append(",");
                bool=false;
            }
            else if(!bool && count%2==1 && i!=0) {
                formatted.append(",");
            }
            
        }
        String result = formatted.reverse().toString();
        if(number != (int) number) {
            result += String.format("%.6f", number - num).substring(1);
        }
        return result;

    }
}
