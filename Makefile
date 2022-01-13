clean:
	rm -rf test/C/.vscode
	rm -f test/C/.clang-format
	rm -f test/C/.clang-tidy
	rm -f test/C/.editorconfig
	rm -f test/C/.gitattributes
	rm -f test/C/.gitignore
	rm -f test/C/*.exe
	rm -rf test/Cpp/.vscode
	rm -f test/Cpp/.clang-format
	rm -f test/Cpp/.clang-tidy
	rm -f test/Cpp/.editorconfig
	rm -f test/Cpp/.gitattributes
	rm -f test/Cpp/.gitignore
	rm -f test/Cpp/*.exe
	rm -rf test/CMinimal/.vscode
	rm -f test/CMinimal/.clang-format
	rm -f test/CMinimal/.clang-tidy
	rm -f test/CMinimal/.editorconfig
	rm -f test/CMinimal/.gitattributes
	rm -f test/CMinimal/.gitignore
	rm -f test/CMinimal/*.exe
	rm -rf test/CppMinimal/.vscode
	rm -f test/CppMinimal/.clang-format
	rm -f test/CppMinimal/.clang-tidy
	rm -f test/CppMinimal/.editorconfig
	rm -f test/CppMinimal/.gitattributes
	rm -f test/CppMinimal/.gitignore
	rm -f test/CppMinimal/*.exe

.phony: clean
